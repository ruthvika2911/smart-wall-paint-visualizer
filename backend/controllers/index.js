const bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),crypto=require('crypto');
const {User,Color,Pattern,Project,Activity,Feedback}=require('../models');
const {err}=require('../middleware/auth');
const log=(userId,action,metadata)=>Activity.create({userId,action,metadata}).catch(()=>{});
const sign=u=>jwt.sign({id:u._id,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});
const pub=u=>({id:u._id,name:u.name,email:u.email,role:u.role});
const HEX=/^#[0-9a-fA-F]{6}$/;
const rgb=h=>`rgb(${[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')})`;
exports.rgb=rgb;
exports.register=async(req,res)=>{ const {name,email,password}=req.body;
 if(!name||name.length<2) throw err(400,'Name required'); if(!/^\S+@\S+\.\S+$/.test(email||'')) throw err(400,'Valid email required');
 if(!password||password.length<8) throw err(400,'Password must be at least 8 characters');
 if(await User.findOne({email:email.toLowerCase()})) throw err(409,'Email already registered');
 const u=await User.create({name:name.trim(),email,passwordHash:await bcrypt.hash(password,12),role:'USER'});
 log(u._id,'register'); res.status(201).json({token:sign(u),user:pub(u)}); };
exports.login=async(req,res)=>{ const u=await User.findOne({email:String(req.body.email||'').toLowerCase()}).select('+passwordHash');
 if(!u||!(await bcrypt.compare(String(req.body.password||''),u.passwordHash))) throw err(401,'Invalid email or password');
 log(u._id,'login'); res.json({token:sign(u),user:pub(u)}); };
exports.me=async(req,res)=>{ const u=await User.findById(req.user.id); if(!u) throw err(401,'User not found'); res.json(pub(u)); };
exports.crud=(Model,label)=>({
 list:async(req,res)=>{ const f={}; if(req.query.category) f.category=req.query.category;
  if(req.query.q) f.name=new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'); res.json(await Model.find(f).sort({createdAt:-1})); },
 get:async(req,res)=>{ const d=await Model.findById(req.params.id); if(!d) throw err(404,label+' not found'); res.json(d); },
 create:async(req,res)=>{ const b={...req.body}; if(Model===Color){ if(!b.name||!HEX.test(b.hex||'')) throw err(400,'name and valid #RRGGBB hex required'); b.rgb=rgb(b.hex);} else if(!b.name) throw err(400,'name required');
  res.status(201).json(await Model.create(b)); },
 update:async(req,res)=>{ const b={...req.body}; if(Model===Color&&b.hex){ if(!HEX.test(b.hex)) throw err(400,'Invalid hex'); b.rgb=rgb(b.hex);}
  const d=await Model.findByIdAndUpdate(req.params.id,b,{new:true,runValidators:true}); if(!d) throw err(404,label+' not found'); res.json(d); },
 remove:async(req,res)=>{ const d=await Model.findByIdAndDelete(req.params.id); if(!d) throw err(404,label+' not found'); res.json({message:'Deleted'}); }});
const checkImg=(s,f)=>{ if(!/^data:image\/(png|jpe?g);base64,/.test(s||'')) throw err(400,f+' must be a JPG/PNG image'); if(s.length>14e6) throw err(413,f+' too large'); };
const owned=async(req)=>{ const p=await Project.findById(req.params.id); if(!p) throw err(404,'Project not found'); if(String(p.userId)!==req.user.id&&req.user.role!=='ADMIN') throw err(403,'Forbidden'); return p; };
const fields=['name','originalPhoto','paintedPhoto','wallSelections','appliedColors','appliedPatterns','settings','favorite'];
exports.projects={
 list:async(req,res)=>{ const f=req.user.role==='ADMIN'&&req.query.all?{}:{userId:req.user.id}; if(req.query.favorite) f.favorite=true;
  res.json(await Project.find(f).select('-originalPhoto').sort({updatedAt:-1})); },
 get:async(req,res)=>res.json(await owned(req)),
 create:async(req,res)=>{ checkImg(req.body.originalPhoto,'originalPhoto'); if(req.body.paintedPhoto) checkImg(req.body.paintedPhoto,'paintedPhoto');
  const b={}; fields.forEach(k=>{if(req.body[k]!==undefined)b[k]=req.body[k]});
  const p=await Project.create({...b,userId:req.user.id,projectId:crypto.randomUUID()});
  await User.findByIdAndUpdate(req.user.id,{$push:{savedProjectRefs:p._id}}); log(req.user.id,'save',{projectId:p.projectId}); res.status(201).json(p); },
 update:async(req,res)=>{ const p=await owned(req); if(req.body.originalPhoto) checkImg(req.body.originalPhoto,'originalPhoto'); if(req.body.paintedPhoto) checkImg(req.body.paintedPhoto,'paintedPhoto');
  fields.forEach(k=>{if(req.body[k]!==undefined)p[k]=req.body[k]}); await p.save();
  if(req.body.favorite!==undefined) await User.findByIdAndUpdate(p.userId,{[req.body.favorite?'$addToSet':'$pull']:{favorites:p._id}});
  log(req.user.id,req.body.favorite!==undefined?'favorite':'update',{projectId:p.projectId}); res.json(p); },
 remove:async(req,res)=>{ const p=await owned(req); await p.deleteOne(); await User.findByIdAndUpdate(p.userId,{$pull:{savedProjectRefs:p._id,favorites:p._id}}); log(req.user.id,'delete'); res.json({message:'Deleted'}); }};
exports.users={ list:async(req,res)=>res.json(await User.find().sort({createdAt:-1})),
 get:async(req,res)=>{ const u=await User.findById(req.params.id); if(!u) throw err(404,'User not found'); res.json(u); } };
exports.activity={ list:async(req,res)=>res.json(await Activity.find().populate('userId','name email').sort({timestamp:-1}).limit(100)),
 create:async(req,res)=>{ if(!['upload','download'].includes(req.body.action)) throw err(400,'Invalid action'); await Activity.create({userId:req.user.id,action:req.body.action,metadata:req.body.metadata}); res.status(201).json({ok:true}); } };
exports.feedback={ create:async(req,res)=>{ const {rating,message}=req.body; if(!(rating>=1&&rating<=5)) throw err(400,'Rating 1-5 required'); res.status(201).json(await Feedback.create({userId:req.user.id,rating,message:String(message||'').slice(0,1000)})); },
 list:async(req,res)=>res.json(await Feedback.find().populate('userId','name').sort({createdAt:-1})) };
exports.analytics=async(req,res)=>{ const top=k=>Project.aggregate([{$unwind:'$appliedColors'},{$group:{_id:'$appliedColors.'+k,count:{$sum:1}}},{$sort:{count:-1}},{$limit:5}]);
 const [users,projects,uploads,logins,all,popularColors,popularCategories,recent]=await Promise.all([User.countDocuments(),Project.countDocuments(),Activity.countDocuments({action:'upload'}),Activity.countDocuments({action:'login'}),Activity.countDocuments(),top('name'),top('category'),Activity.find().populate('userId','name').sort({timestamp:-1}).limit(8)]);
 res.json({totalUsers:users,totalSavedDesigns:projects,totalUploadedRooms:uploads,totalLogins:logins,avgActionsPerUser:users?+(all/users).toFixed(1):0,popularColors,popularCategories,recentActivity:recent}); };
