const mongoose=require('mongoose');
module.exports=async()=>{ if(!process.env.MONGO_URI||!process.env.JWT_SECRET) throw new Error('Set MONGO_URI and JWT_SECRET in .env'); await mongoose.connect(process.env.MONGO_URI); };
