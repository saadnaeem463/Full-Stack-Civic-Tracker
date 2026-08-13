import{Schema,model,models} from 'mongoose'

const WorkersSchema=new Schema({
    fullname : {type : String,required: true},
    email : {type : String,required: true,unique:true},
    specialty : {
        type : String,
        enum : ["Roads crew", "Electrical", "Sanitation", "Parks"],
        required : true
    },
    status : {type : String,enum : ['Busy','Free'],default : "Free"},
    jobsCompleted : {type : Number,default : 0},
    currentReport : {type : Schema.Types.ObjectId,ref : "Report",default : null},
    active : {type : Boolean,default : true}
},{timestamps : true})

export const Workers=models.Workers || model("Workers",WorkersSchema)