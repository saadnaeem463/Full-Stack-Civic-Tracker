import {Schema,model,models,Types} from 'mongoose'

const SINGLETON_ID=new Types.ObjectId("000000000000000000000001")
const BudgetSchema=new Schema({
    _id : {type : Schema.Types.ObjectId,default : SINGLETON_ID},
    Amount : {type : Number,required : true,default : 0}
},{timestamps : true})

export const Budget=models.Budget || model("Budget",BudgetSchema)
export {SINGLETON_ID}