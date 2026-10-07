import dotenv from "dotenv";

dotenv.config();
console.log(
    "Mongo URI:",
    process.env.MONGO_URI
);
import mongoose from "mongoose";
import Onboarding from "../models/Onboarding.js";


await mongoose.connect(process.env.MONGO_URI);


const onboarding =
await Onboarding.findOne({
    school:
    "6a31c9225712904612e6d81b"
});


onboarding.completedSteps = [
    "school_profile",
    "academic_session"
];


onboarding.progress = 20;


onboarding.currentStep = "terms";


await onboarding.save();


console.log(
    "Onboarding repaired"
);


process.exit();