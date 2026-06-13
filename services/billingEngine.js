import Subscription from "../models/Subscription.js";

export const billingEngine = async (
  schoolId
) => {
  const subscriptions =
    await Subscription.find({
      school: schoolId,
    }).sort({
      createdAt: -1,
    });

  const totalSpent =
    subscriptions.reduce(
      (sum, item) =>
        sum + (item.amount || 0),
      0
    );

  return {
    totalSpent,
    payments: subscriptions.length,
    latestPlan:
      subscriptions[0]?.plan || "Trial",
    history: subscriptions,
  };
};