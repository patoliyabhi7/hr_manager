import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee"
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime:{
        type: Date,
        required: true
    },
    workHours: {
        type: Number
    },
    notes: {
        type: String
    }
})

const Attendance = mongoose.model("Attendance", attendanceSchema)
module.exports = Attendance