import { Schema, model, models } from "mongoose";

const CommentSchema= new Schema({
    author : {type : String,required : true},
    text :{type : String}
},{timestamps : true})

const InternalNoteSchema= new Schema({
    author : {type : String,required : true},
    text :{type : String}
},{timestamps : true})

const HistorySchema=new Schema({
  status : {type : String,enum : ['Reported','Acknowledged','In progress','Resolved'], required : true },
  by : {type : String, required : true}
},{timestamps : true})

const ReportSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issueType: {type: String,required: true,},
  title: { type: String, required: true },
  details : {type : String},
  lat : {type : Number},
  lng : {type : Number},
  media: [{
    url : {type : String,required: true},
    type : {type : String,required: true},
    poster : {type : String}
  }],
  location : {type : String,required : true},
  upVotedBy : [{type : Schema.Types.ObjectId,ref : "User"}],
  commentCount :{type : Number,default : 0},
  status : {type : String, enum : ['Reported','Acknowledged','In progress','Resolved']},
  accessibilityFlag: { type: Boolean, default: false },
  comments : [CommentSchema],

  //admin fields hn hamari yahan
  assignedTo  :{type : Schema.Types.ObjectId, ref : "Workers",default : null},
  suspicious : {type : Boolean,default : false},
  internalNotes : [InternalNoteSchema],
  history : [HistorySchema]
},{ timestamps: true });

export const Report= models.Report || model("Report",ReportSchema)