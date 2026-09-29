import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["upvote", "comment", "status_change", "new_report", "note_added"],
    required: true,
  },
  report: { type: Schema.Types.ObjectId, ref: "Report", default: null },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  triggeredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = models.Notification || model("Notification", NotificationSchema);
