import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
const userSchema=new Schema({
  UserName:{
    type:String,
    require:true,
    unique:true,
  },
  Email:{
    type:String,
    require:true,
    unique:true,
  },
  FullName:{
    type:String,
    require:true,
  },
  Password:{
    type:String,
    require:true
  },
  CoverImg:{
    type:String,
    default:""
  },
  ProfileImg:{
    type:String,
    default:""
  },
  Bio:{
    type:String,
    default:""
  },
  Links:{
    type:String,
    default:""
  },
  RefreshToken:{
    type:String,
    default:""
  }
}
,{
    timestamps:true,
}
)
userSchema.pre("save",async function(next){
    if(!this.isModified("Password")){
        return next();
    }
    this.Password=await bcrypt.hash(this.Password,10);
    next();
})
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.Password);
}
userSchema.methods.generateAccessToken=async function(){
    return jwt.sign({
        _id:this._id,
        Email:this.Email,
        UserName:this.UserName,
        FullName:this.FullName
    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
);
}

userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
const User=mongoose.model("User",userSchema);
export default User;