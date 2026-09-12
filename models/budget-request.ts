import mongoose, { Schema,model,models } from "mongoose";

const BudgetRequestSchema=new Schema({
    category : {type : String,enum : ['Roads','Lightning','Cleanliness','Parks'],required : true},
    requestedBy : {type : mongoose.Types.ObjectId,ref : "User",required : true},
    requesterNote : {type : String,required : true},
    status : {type : String,enum : ["Pending","Approved","Rejected"],default : "Pending"},
    adminNote : {type : String,default : null},
    reviewedBy : {type : mongoose.Types.ObjectId,ref : "User",default : null},
    reviewedAt : {type : Date,default : null}
},{timestamps : true}
)

BudgetRequestSchema.index(
    {category : 1},
    {unique : true,partialFilterExpression : {status :'Pending'}}
)
export const BudgetRequest=models.BudgetRequest || model("BudgetRequest",BudgetRequestSchema)