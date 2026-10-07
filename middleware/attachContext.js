import User from "../models/User.js";
import School from "../models/School.js";

export const attachContext = async (
req,
res,
next
) => {
try {
console.log("AUTH USER:", req.user);

const user = await User.findById(
  req.user.id
);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

const school = await School.findById(
  user.school
);

if (!school) {
  return res.status(404).json({
    success: false,
    message: "School not found",
  });
}

req.user = user;
req.school = school;
req.school = school._id;

req.context = {
  school: school._id,
  schoolName: school.name,
  plan: school.subscriptionPlan,
  userId: user._id,
  role: user.role,
};

console.log(
  "SCHOOL CONTEXT:",
  req.context
);

next();

} catch (error) {
console.error(
"ATTACH CONTEXT ERROR:",
error
);

return res.status(500).json({
  success: false,
  message: error.message,
});
}
};
