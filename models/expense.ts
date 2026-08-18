import mongoose, {model,models,Schema} from 'mongoose'

const ExpenseSchema=new Schema({
    reportId : {type : mongoose.Types.ObjectId,ref :"Report",required : true},
    label : {type : String,ref :"Report",required : true},
    category : {type : String,enum : ['Roads','Lightning','Cleanliness','Parks'],required : true},
    amount : {type : Number,required : true}
},{timestamps : true})

export const Expense=models.Expense || model("Expense",ExpenseSchema)