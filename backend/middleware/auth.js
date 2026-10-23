const jwt=require('jsonwebtoken');
const err=(s,m)=>Object.assign(new Error(m),{status:s});
exports.wrap=fn=>(q,s,n)=>Promise.resolve(fn(q,s,n)).catch(n);
exports.auth=(req,res,next)=>{ const t=(req.headers.authorization||'').replace('Bearer ','');
 try{req.user=jwt.verify(t,process.env.JWT_SECRET);next();}catch{next(err(401,'Authentication required'));} };
exports.admin=(req,res,next)=>req.user?.role==='ADMIN'?next():next(err(403,'Admin only'));
exports.err=err;
