import PaymentAudit from "../models/PaymentAudit.js";

export const createAuditLog = async ({
  school,
  actorId,
  paymentId,
  action,
  before,
  after,
  ipAddress,
}) => {
  return await PaymentAudit.create({
    school,
    actorId,
    paymentId,
    action,
    before,
    after,
    ipAddress,
  });
};