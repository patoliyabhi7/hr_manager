const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee"
    },
    date: {
        type: String,
        unique: false
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    workHoursAndMinutes: {
        type: String
    },
    notes: {
        type: String
    }
})

const Attendance = mongoose.model("Attendance", attendanceSchema)
module.exports = Attendance