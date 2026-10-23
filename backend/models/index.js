const {Schema,model,Types}=require('mongoose');
const M=(n,def,opt={timestamps:{createdAt:'createdAt',updatedAt:false}})=>model(n,new Schema(def,opt));
exports.User=M('User',{name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['USER','ADMIN'],default:'USER'},savedProjectRefs:[{type:Types.ObjectId,ref:'Project'}],favorites:[{type:Types.ObjectId,ref:'Project'}]});
exports.Color=M('Color',{name:{type:String,required:true},hex:{type:String,required:true},rgb:String,brand:String,manufacturer:String,finish:{type:String,default:'matte'},category:{type:String,default:'General'},swatch:String});
exports.Pattern=M('Pattern',{name:{type:String,required:true},description:String,category:String,style:{type:String,enum:['stripes','dots','checks'],default:'stripes'},image:String,dimensions:{width:Number,height:Number}});
exports.Project=M('Project',{projectId:{type:String,unique:true},userId:{type:Types.ObjectId,ref:'User',index:true},name:String,originalPhoto:String,paintedPhoto:String,wallSelections:[Schema.Types.Mixed],appliedColors:[Schema.Types.Mixed],appliedPatterns:[Schema.Types.Mixed],settings:Schema.Types.Mixed,favorite:{type:Boolean,default:false}},{timestamps:true});
exports.Activity=M('Activity',{userId:{type:Types.ObjectId,ref:'User'},action:String,timestamp:{type:Date,default:Date.now},metadata:Schema.Types.Mixed},{});
exports.Feedback=M('Feedback',{userId:{type:Types.ObjectId,ref:'User'},rating:{type:Number,min:1,max:5},message:String});
