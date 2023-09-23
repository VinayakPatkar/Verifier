const mongoose = require("mongoose")
const internshipSchema = new mongoose.Schema({
    RollNo : Number,
    OrgName: String,
    InternDesignation: String,
    duration: String,
  });
const JobSchema = new mongoose.Schema({
    JobID : Number,
    JobProfile : String,
    JobLocation : String,
    Salary : Number,
    Bond : Number
})
const GeneralCertificate = new mongoose.Schema({
    RollNo : Number,
    SPCC : Number,
    CSS : Number,
    AI : Number,
    MC : Number,
    QA : Number

})
const UserSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['internship', 'job_offer'],
        required: true,
      },
    fname : {
        type : String
    },
    lname : {
        type : String
    },
    email : {
        type : String
    },
    AadharNo : {
        type : Number
    },
    internshipDetails : [internshipSchema],
    jobDetails : [JobSchema],
    normalDetails : [GeneralCertificate]
})
const User = mongoose.model('User', UserSchema);

module.exports = User;