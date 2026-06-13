import School from "../models/School.js";

export const getSchoolProfile =
  async (req, res) => {
    const school =
      await School.findById(
        req.school._id
      );

    res.json(school);
  };

export const updateSchoolProfile =
  async (req, res) => {
    const school =
      await School.findByIdAndUpdate(
        req.school._id,
        req.body,
        { new: true }
      );

    res.json(school);
  };

export const getSchoolStats =
  async (req, res) => {
    res.json({
      schoolName: req.school.name,
      plan:
        req.school.subscriptionPlan,
      trialEndsAt:
        req.school.trialEndsAt,
    });
  };