import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
{
school: {
type: mongoose.Schema.Types.ObjectId,
ref: "School",
required: true,
unique: true,
index: true,
},

/*
=====================================
PLAN
=====================================
*/
plan: {
  type: String,
  enum: [
    "Trial",
    "Starter",
    "Growth",
    "Enterprise",
  ],
  default: "Trial",
},

status: {
  type: String,
  enum: [
    "active",
    "inactive",
    "expired",
    "cancelled",
    "pending",
  ],
  default: "active",
},

/*
=====================================
BILLING
=====================================
*/
amount: {
  type: Number,
  default: 0,
},

currency: {
  type: String,
  default: "NGN",
},

billingCycle: {
  type: String,
  enum: [
    "monthly",
    "term",
    "yearly",
  ],
  default: "term",
},

/*
=====================================
PLAN LIMITS
=====================================
*/
maxStudents: {
  type: Number,
  default: 100,
},

maxTeachers: {
  type: Number,
  default: 20,
},

maxBranches: {
  type: Number,
  default: 1,
},

whatsappEnabled: {
  type: Boolean,
  default: false,
},

parentPortalEnabled: {
  type: Boolean,
  default: true,
},

analyticsEnabled: {
  type: Boolean,
  default: false,
},

customBranding: {
  type: Boolean,
  default: false,
},

/*
=====================================
PAYMENT
=====================================
*/
provider: {
  type: String,
  default: "paystack",
},

reference: String,

paymentDate: Date,

/*
=====================================
DATES
=====================================
*/
startDate: {
  type: Date,
  default: Date.now,
},

endDate: Date,

nextBillingDate: Date,

autoRenew: {
  type: Boolean,
  default: true,
},

/*
=====================================
HISTORY
=====================================
*/
previousPlan: {
  type: String,
  enum: [
    "Trial",
    "Starter",
    "Growth",
    "Enterprise",
  ],
},

upgradedAt: Date,

cancelledAt: Date,

},
{
timestamps: true,
}
);

/*

# ACTIVE CHECK

*/
subscriptionSchema.methods.isActive =
function () {
return (
this.status === "active" &&
(!this.endDate ||
new Date() < this.endDate)
);
};

/*

# EXPIRY CHECK

*/
subscriptionSchema.methods.isExpired =
function () {
return (
this.endDate &&
new Date() > this.endDate
);
};

export default mongoose.model(
"Subscription",
subscriptionSchema
);
