require('dotenv').config({path:require('path').join(__dirname,'../.env')});
const bcrypt=require('bcryptjs'),mongoose=require('mongoose');
const {Color,Pattern,User}=require('../models');const {rgb}=require('../controllers');
const colors=[['Warm Beige','#F5E6D3','Neutral'],['Soft Peach','#F4B6A6','Warm'],['Sage Green','#A8B89F','Green'],['Sky Blue','#9CC9E8','Cool'],['Lavender','#C5B4D9','Cool'],['Cream','#FFF1C1','Neutral'],['Terracotta','#C96F52','Warm'],['Charcoal','#4A4A4A','Dark']];
const patterns=[['Classic Stripes','stripes','Lines'],['Polka Dots','dots','Dots'],['Checkerboard','checks','Geometric']];
(async()=>{ await mongoose.connect(process.env.MONGO_URI);
 for(const [name,hex,category] of colors) await Color.updateOne({name},{$setOnInsert:{name,hex,rgb:rgb(hex),category,brand:'Generic',manufacturer:'Generic',finish:'matte'}},{upsert:true});
 for(const [name,style,category] of patterns) await Pattern.updateOne({name},{$setOnInsert:{name,style,category,description:name+' pattern',dimensions:{width:64,height:64}}},{upsert:true});
 const {ADMIN_EMAIL:e,ADMIN_PASSWORD:p}=process.env;
 if(e&&p&&p.length>=8){ if(!(await User.findOne({email:e.toLowerCase()}))) await User.create({name:'Administrator',email:e,passwordHash:await bcrypt.hash(p,12),role:'ADMIN'}); console.log('Admin ready:',e); }
 else console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set (min 8 chars): admin skipped');
 console.log('Seed complete'); await mongoose.disconnect(); })().catch(e=>{console.error(e.message);process.exit(1)});
