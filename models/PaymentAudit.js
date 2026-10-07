import mongoose from "mongoose";

const paymentAuditSchema = new mongoose.Schema(
  {
    school: mongoose.Schema.Types.ObjectId,

    actorId: mongoose.Schema.Types.ObjectId,

    paymentId: mongoose.Schema.Types.ObjectId,

    action: String,

    before: Object,

    after: Object,

    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "PaymentAudit",
  paymentAuditSchema
);