import Subscription from "../models/Subscription.js";

export const activateSubscription = async ({
  school,
  plan,
  amount,
  reference,
}) => {
  let subscription = await Subscription.findOne({
    school,
  });

  const startDate = new Date();

  const endDate = new Date();

  endDate.setMonth(endDate.getMonth() + 1);

  if (!subscription) {
    subscription = await Subscription.create({
      school,
      plan,
      amount,
      reference,
      status: "active",
      startDate,
      endDate,
    });

    return subscription;
  }

  subscription.plan = plan;
  subscription.amount = amount;
  subscription.reference = reference;
  subscription.status = "active";
  subscription.startDate = startDate;
  subscription.endDate = endDate;

  await subscription.save();

  return subscription;
};

export const getSubscriptionBySchool = async (
  school
) => {
  return Subscription.findOne({
    school,
  });
};

export const deactivateSubscription = async (
  school
) => {
  return Subscription.findOneAndUpdate(
    { school },
    {
      status: "inactive",
    },
    { new: true }
  );
};