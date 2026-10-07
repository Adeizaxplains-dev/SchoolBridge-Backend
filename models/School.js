// ============================================================
// backend/models/School.js
// SchoolBridge Enterprise Multi Tenant School Model
// ============================================================

import mongoose from "mongoose";


const {Schema}=mongoose;



const schoolSchema=new Schema(

{

// ============================================================
// BASIC SCHOOL INFORMATION
// ============================================================


name:{
type:String,
required:true,
trim:true
},



slug:{
type:String,
unique:true,
lowercase:true,
trim:true
},



code:{
type:String,
required:true,
unique:true,
uppercase:true,
trim:true
},



email:{
type:String,
required:true,
lowercase:true,
trim:true
},



phone:{
type:String,
default:""
},



alternatePhone:{
type:String,
default:""
},



website:{
type:String,
default:""
},



address:{
type:String,
default:""
},



city:{
type:String,
default:""
},



state:{
type:String,
default:""
},



country:{
type:String,
default:"Nigeria"
},





// ============================================================
// SCHOOL OWNER
// ============================================================


owner:{

type:Schema.Types.ObjectId,

ref:"User",

default:null

},





// ============================================================
// BRANDING
// ============================================================


logo:{
type:String,
default:""
},


favicon:{
type:String,
default:""
},


motto:{
type:String,
default:""
},



primaryColor:{
type:String,
default:"#2563eb"
},



secondaryColor:{
type:String,
default:"#1e293b"
},





// ============================================================
// SCHOOL TYPE
// ============================================================


schoolType:{

type:String,

enum:[

"Primary",
"Secondary",
"Primary & Secondary",
"College",
"University"

],

default:"Secondary"

},



ownership:{

type:String,

enum:[

"Private",
"Public",
"Mission"

],

default:"Private"

},



establishedYear:{

type:Number,

default:null

},




// ============================================================
// ACADEMIC CONTEXT
// ============================================================


currentAcademicSession:{

type:Schema.Types.ObjectId,

ref:"AcademicSession",

default:null

},



currentTerm:{

type:Schema.Types.ObjectId,

ref:"Term",

default:null

},



// ============================================================
// ONBOARDING
// ============================================================


onboardingCompleted:{

type:Boolean,

default:false

},



onboardingPercentage:{

type:Number,

default:0,

min:0,

max:100

},



currentSetupStep:{

type:String,

default:"school_profile"

},



setup:{


schoolProfile:{
type:Boolean,
default:false
},


academicSession:{
type:Boolean,
default:false
},


terms:{
type:Boolean,
default:false
},


classes:{
type:Boolean,
default:false
},


arms:{
type:Boolean,
default:false
},


subjects:{
type:Boolean,
default:false
},


departments:{
type:Boolean,
default:false
},


houses:{
type:Boolean,
default:false
},


feeStructure:{
type:Boolean,
default:false
},


gradingSystem:{
type:Boolean,
default:false
}


},



setupProgress:{

type:Number,

default:0

},



setupCompleted:{

type:Boolean,

default:false

},



setupCompletedAt:{

type:Date,

default:null

},



lastSetupStep:{

type:String,

default:"schoolProfile"

},

// ============================================================
// SCHOOL SETTINGS
// ============================================================


settings:{

currency:{

type:String,

default:"NGN"

},


timezone:{

type:String,

default:"Africa/Lagos"

},



academicYearStart:{

type:Number,

default:9

},



gradingType:{

type:String,

enum:[

"percentage",
"letter",
"gpa"

],

default:"percentage"

}

},





// ============================================================
// SUBSCRIPTION SYSTEM
// SchoolBridge SaaS Billing
// ============================================================


subscriptionPlan:{

type:String,

enum:[

"trial",
"basic",
"premium",
"enterprise"

],

default:"trial"

},



subscriptionStatus:{

type:String,

enum:[

"trial",
"active",
"expired",
"cancelled",
"suspended"

],

default:"trial"

},



trialEndsAt:{

type:Date,

default:()=>{

const date=new Date();

date.setDate(
date.getDate()+14
);

return date;

}

},



subscriptionStartDate:{

type:Date,

default:null

},



subscriptionEndDate:{

type:Date,

default:null

},



currentSubscriptionId:{

type:Schema.Types.ObjectId,

ref:"Subscription",

default:null

},






// ============================================================
// RESOURCE LIMITS
// ============================================================


studentLimit:{

type:Number,

default:100

},



teacherLimit:{

type:Number,

default:20

},



parentLimit:{

type:Number,

default:100

},



branchLimit:{

type:Number,

default:1

},






// ============================================================
// ENABLED FEATURES
// ============================================================


features:{


attendance:{

type:Boolean,

default:true

},



resultManagement:{

type:Boolean,

default:true

},



assignments:{

type:Boolean,

default:true

},



messaging:{

type:Boolean,

default:true

},



finance:{

type:Boolean,

default:true

},



library:{

type:Boolean,

default:false

},



hostel:{

type:Boolean,

default:false

},



transport:{

type:Boolean,

default:false

}



},





// ============================================================
// STATISTICS CACHE
// ============================================================


statistics:{


students:{

type:Number,

default:0

},



teachers:{

type:Number,

default:0

},



parents:{

type:Number,

default:0

},



classes:{

type:Number,

default:0

}



},






// ============================================================
// STATUS
// ============================================================


isActive:{

type:Boolean,

default:true

},



isVerified:{

type:Boolean,

default:false

},



lastLogin:{

type:Date,

default:null

},



lastPaymentDate:{

type:Date,

default:null

},



nextBillingDate:{

type:Date,

default:null

}



},



{

timestamps:true,

versionKey:false

}

);





// ============================================================
// INDEXES
// IMPORTANT:
// No duplicate indexes.
// unique fields already create indexes.
// ============================================================


schoolSchema.index({

email:1

});



schoolSchema.index({

owner:1

});



schoolSchema.index({

owner:1,

isActive:1

});



schoolSchema.index({

onboardingCompleted:1,

onboardingPercentage:1

});



schoolSchema.index({

currentAcademicSession:1

});



schoolSchema.index({

currentTerm:1

});



schoolSchema.index({

isActive:1

});





// ============================================================
// INSTANCE METHODS
// ============================================================


schoolSchema.methods.calculateSetupProgress=function(){


const modules=[


this.setup.schoolProfile,

this.setup.academicSession,

this.setup.terms,

this.setup.classes,

this.setup.arms,

this.setup.subjects,

this.setup.departments,

this.setup.houses,

this.setup.feeStructure,

this.setup.gradingSystem


];




const completed=

modules.filter(Boolean).length;



const total=

modules.length;



const percentage=

Math.round(
(completed/total)*100
);




this.setupProgress=
percentage;



this.onboardingPercentage=
percentage;



const finished=

completed===total;



this.setupCompleted=
finished;



this.onboardingCompleted=
finished;




if(finished){

this.setupCompletedAt=
new Date();

}




const order=[


"schoolProfile",

"academicSession",

"terms",

"classes",

"arms",

"subjects",

"departments",

"houses",

"feeStructure",

"gradingSystem"


];



const stepMap={


schoolProfile:"school_profile",

academicSession:"academic_session",

terms:"terms",

classes:"classes",

arms:"arms",

subjects:"subjects",

departments:"departments",

houses:"houses",

feeStructure:"fee_structure",

gradingSystem:"grading_system"


};



const nextStep=

order.find(
step=>!this.setup[step]
);




this.lastSetupStep=

nextStep || "completed";



this.currentSetupStep=

nextStep

?

stepMap[nextStep]

:

"completed";




return {

progress:percentage,

completed:finished,

nextStep:this.currentSetupStep

};



};







// ============================================================
// VIRTUALS
// ============================================================


schoolSchema.virtual(
"isTrialExpired"
)
.get(function(){


return (

this.subscriptionStatus==="trial"

&&

this.trialEndsAt

&&

this.trialEndsAt < new Date()

);


});






schoolSchema.virtual(
"isSubscriptionActive"
)
.get(function(){


return (

this.subscriptionStatus==="trial"

||

this.subscriptionStatus==="active"

);


});






// ============================================================
// JSON CONFIGURATION
// ============================================================


schoolSchema.set(

"toJSON",

{

virtuals:true

}

);



schoolSchema.set(

"toObject",

{

virtuals:true

}

);






// ============================================================
// MODEL EXPORT
// ============================================================


const School =

mongoose.models.School ||

mongoose.model(

"School",

schoolSchema

);



export default School;

