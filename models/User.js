// ============================================================
// backend/models/User.js
// SchoolBridge Enterprise Multi Tenant User Model
// ============================================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(

{

// ============================================================
// MULTI TENANT SCHOOL RELATIONSHIP
// ============================================================

school: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "School",

    required:true,

    index:true,

},


// ============================================================
// BASIC PROFILE
// ============================================================

fullName: {

    type:String,

    required:true,

    trim:true,

},


email: {

    type:String,

    required:true,

    lowercase:true,

    trim:true,

},


phone: {

    type:String,

    default:"",

    trim:true,

},


profileImage: {

    type:String,

    default:"",

},



// ============================================================
// AUTHENTICATION
// ============================================================

password: {

    type:String,

    required:true,

    minlength:6,

    select:false,

},


// ============================================================
// USER ROLE
// ============================================================

role: {

    type:String,

    enum:[

        "superadmin",

        "admin",

        "principal",

        "teacher",

        "parent",

        "accountant",

        "staff"

    ],

    default:"admin",

    index:true,

},



// ============================================================
// PROFILE REFERENCES
// ============================================================

teacherId: {

    type:mongoose.Schema.Types.ObjectId,

    ref:"Teacher",

    default:null,

},


parentId: {

    type:mongoose.Schema.Types.ObjectId,

    ref:"Parent",

    default:null,

},



// ============================================================
// SCHOOL OWNER
// ============================================================

isSchoolOwner: {

    type:Boolean,

    default:false,

    index:true,

},



// ============================================================
// ONBOARDING
// ============================================================

onboardingCompleted: {

    type:Boolean,

    default:false,

},


lastOnboardingStep: {

    type:String,

    default:"school_profile",

},



// ============================================================
// ACCOUNT STATUS
// ============================================================

status: {

    type:String,

    enum:[

        "active",

        "inactive",

        "suspended",

        "locked"

    ],

    default:"active",

    index:true,

},



// ============================================================
// SECURITY
// ============================================================


lastLogin: {

    type:Date,

    default:null,

},



passwordChangedAt: {

    type:Date,

    default:null,

},



emailVerified: {

    type:Boolean,

    default:false,

},



failedLoginAttempts: {

    type:Number,

    default:0,

},



lockUntil: {

    type:Date,

    default:null,

},



// ============================================================
// REFRESH TOKEN SUPPORT
// ============================================================

refreshToken: {

    type:String,

    default:null,

    select:false,

},



},

{

timestamps:true,

versionKey:false

}

);




// ============================================================
// INDEXES
// ============================================================


userSchema.index(
{
    email:1
},
{
    unique:true
}
);


userSchema.index(
{
    school:1,
    role:1
}
);


userSchema.index(
{
    school:1,
    status:1
}
);





// ============================================================
// PASSWORD HASHING
// IMPORTANT:
// Async mongoose middleware DOES NOT use next()
// ============================================================


userSchema.pre(
"save",
async function(){

    /*
    Password has not changed.
    Do nothing.
    */

    if(
        !this.isModified("password")
    ){

        return;

    }



    const salt =
    await bcrypt.genSalt(10);



    this.password =
    await bcrypt.hash(

        this.password,

        salt

    );



    this.passwordChangedAt =
    new Date();


});





// ============================================================
// PASSWORD COMPARE
// ============================================================


userSchema.methods.comparePassword =

async function(candidatePassword){

    return await bcrypt.compare(

        candidatePassword,

        this.password

    );

};





// ============================================================
// ACCOUNT LOCK CHECK
// ============================================================


userSchema.methods.isLocked =

function(){

    return (

        this.lockUntil &&

        this.lockUntil > Date.now()

    );

};





// ============================================================
// REMOVE SENSITIVE DATA
// ============================================================


userSchema.methods.toJSON =

function(){

    const obj =
    this.toObject();


    delete obj.password;

    delete obj.refreshToken;


    return obj;

};




// ============================================================
// EXPORT MODEL
// ============================================================


const User = mongoose.model(

"User",

userSchema

);


export default User;