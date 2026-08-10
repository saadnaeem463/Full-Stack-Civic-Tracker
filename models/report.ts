import { Schema, model, models } from "mongoose";

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
    type : {type : String,required: true}
  }],
  location : {type : String,required : true},
  upVoteCount : {type : Number,default : 0},
  commentCount :{type : Number,default : 0},
  status : {type : String, enum : ['open','in-progress','resolved'] , default : 'open'},
  accessibilityFlag: { type: Boolean, default: false },
  comments : [{
    postUserId : {
      type : Schema.Types.ObjectId,
      ref : "User",
      required : true
    },
    comment :{type : String}
  }]
},{ timestamps: true });

export const Report= models.Report || model("Report",ReportSchema)