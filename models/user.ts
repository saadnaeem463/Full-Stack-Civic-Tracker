import {Schema,models,model} from "mongoose"
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified : {type : Boolean,default : false},
  verificationToken : {type : String},
  verificationTokenExpiry : {type : Date},
  
}, { timestamps: true });

export const User = models.User || model("User", UserSchema);