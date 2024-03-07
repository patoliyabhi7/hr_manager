import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee"
    },
    leaveType: {
        type: String,
        enum: ['Casual Leave', 'Earned Leave', 'No Pay Leave', 'Sick Leave', 'Paternity Leave'],
        required: true
    },
    leaveStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Not Approved'],
        default: "Pending"
    },
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    }
})

const Leave = mongoose.model("Leave", leaveSchema)
module.exports = Leave