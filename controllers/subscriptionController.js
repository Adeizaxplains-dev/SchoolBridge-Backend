import Subscription from "../models/Subscription.js";
import School from "../models/School.js";
import { PLANS } from "../config/plans.js";

import {
initializePayment,
verifyPayment,
} from "../services/paystackService.js";

/*

# INITIALIZE SUBSCRIPTION PAYMENT

*/
export const initializeSubscriptionPayment = async (
req,
res
) => {
try {
const { plan } = req.body;


const school = req.school;
const user = req.user;

const selectedPlan = PLANS[plan];

if (!selectedPlan) {
  return res.status(400).json({
    success: false,
    message: "Invalid plan selected",
  });
}

const activeSubscription =
  await Subscription.findOne({
    school: school._id,
    status: "active",
  });

if (
  activeSubscription &&
  activeSubscription.plan === plan
) {
  return res.status(400).json({
    success: false,
    message:
      "You are already subscribed to this plan",
  });
}

const payment = await initializePayment({
  email: user.email,

  amount:
    selectedPlan.amount * 100,

  callback_url:
    `${process.env.FRONTEND_URL}/billing?status=success`,

  metadata: {
    type: "subscription",
    school: school._id,
    userId: user._id,
    plan,
  },
});

return res.status(200).json({
  success: true,
  authorization_url:
    payment.data.authorization_url,
  reference:
    payment.data.reference,
});

} catch (error) {
console.error(
"Initialize Subscription Error:",
error
);

return res.status(500).json({
  success: false,
  message: error.message,
});

}
};

/*

# GET CURRENT SUBSCRIPTION

*/
export const getSubscription = async (
req,
res
) => {
try {
const subscription =
await Subscription.findOne({
school: req.school._id,
});

if (!subscription) {
  return res.json({
    success: true,
    data: {
      plan: "Trial",
      amount: 0,
      status: "active",
    },
  });
}

return res.json({
  success: true,
  data: subscription,
});

} catch (error) {
return res.status(500).json({
success: false,
message: error.message,
});
}
};

/*

# UPGRADE PLAN

*/
export const upgradePlan = async (
req,
res
) => {
try {
const { plan, reference } =
req.body;

const selectedPlan =
  PLANS[plan];

if (!selectedPlan) {
  return res.status(400).json({
    success: false,
    message: "Invalid plan selected",
  });
}

if (reference) {
  const payment =
    await verifyPayment(
      reference
    );

  if (
    payment?.data?.status !==
    "success"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Payment verification failed",
    });
  }
}

const startDate =
  new Date();

const endDate =
  new Date();

endDate.setMonth(
  endDate.getMonth() + 4
);

const subscription =
  await Subscription.findOneAndUpdate(
    {
      school:
        req.school._id,
    },
    {
      school:
        req.school._id,

      plan,

      amount:
        selectedPlan.amount,

      maxStudents:
        selectedPlan.maxStudents,

      billingCycle:
        selectedPlan.billingCycle,

      status: "active",

      reference:
        reference || null,

      startDate,

      endDate,

      nextBillingDate:
        endDate,

      previousPlan:
        req.school
          .subscriptionPlan,
    },
    {
      new: true,
      upsert: true,
    }
  );

await School.findByIdAndUpdate(
  req.school._id,
  {
    subscriptionPlan:
      plan,

    subscriptionStatus:
      "active",
  }
);

return res.json({
  success: true,
  message:
    "Subscription upgraded successfully",
  data: subscription,
});

} catch (error) {
console.error(
"Upgrade Plan Error:",
error
);

return res.status(500).json({
  success: false,
  message: error.message,
});

}
};

/*

# CANCEL SUBSCRIPTION

*/
export const cancelSubscription = async (
req,
res
) => {
try {
const subscription =
await Subscription.findOneAndUpdate(
{
school:
req.school._id,
},
{
status:
"cancelled",

      autoRenew: false,

      cancelledAt:
        new Date(),
    },
    {
      new: true,
    }
  );

await School.findByIdAndUpdate(
  req.school._id,
  {
    subscriptionStatus:
      "cancelled",
  }
);

return res.json({
  success: true,
  message:
    "Subscription cancelled successfully",
  data: subscription,
});

} catch (error) {
return res.status(500).json({
success: false,
message: error.message,
});
}
};
