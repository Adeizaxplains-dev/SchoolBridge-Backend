import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import Subscription from "../models/Subscription.js";
import School from "../models/School.js";

export const analyticsEngine = async (schoolId) => {
  const school = await School.findById(schoolId);

  const totalStudents = await Student.countDocuments({
    school: schoolId,
  });

  const fees = await Fee.find({
    school: schoolId,
  });

  const totalRevenue = fees.reduce(
    (sum, fee) => sum + (fee.paidAmount || 0),
    0
  );

  const totalOutstanding = fees.reduce(
    (sum, fee) => sum + (fee.balance || 0),
    0
  );

  const subscription = await Subscription.findOne({
    school: schoolId,
  });

  return {
    schoolName: school?.name || "School",
    totalStudents,
    totalRevenue,
    totalOutstanding,
    plan: subscription?.plan || "Trial",
    status: subscription?.status || "inactive",
    maxStudents: subscription?.maxStudents || 50,
  };
};