import { model, models,Schema, } from "mongoose";

const AuditLogSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  actorRole: { type: String, enum: ["admin", "moderator"], required: true },
  actorName : {type : String, required : true},

  action: {
    type: String,
    enum: ["status_changed", "note_added", "worker_assigned", "worker_unassigned", "expense_added", "budget_allocated"],
    required: true,
  },

  message: { type: String, required: true },
}, { timestamps: true });

AuditLogSchema.index({ reportId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);