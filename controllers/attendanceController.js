const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/employeeModel');
const Attendance = require('./../models/attendanceModel');
const { format } = require('date-fns');

exports.checkInAttendance = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.user?.id)
    // console.log(employee_id)
    const currentDate = format(new Date(), "dd-MM-yyyy");
    if (!employee) {
        return next(new AppError("Employee not found or not LoggedIn", 404))
    }
    const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        date: currentDate
    })
    if (existingAttendance) {
        return next(new AppError("You have already checkedIn for today", 400))
    }
    const checkedIn = await Attendance.create({
        employee: employee._id,
        date: currentDate,
        checkInTime: Date.now(),
        notes: "CheckedIn Successfully"
    })

    if (!checkedIn) {
        return next(new AppError("Something went wrong while CheckIn the employee", 500))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: checkedIn
        }
    })
})

exports.checkOutAttendance = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.user?.id);
    const currentDate = format(new Date(), "dd-MM-yyyy");

    if (!employee) {
        return next(new AppError("Employee not found or not LoggedIn", 404));
    }

    const existingAttendance = await Attendance.findOne({
        employee: employee._id,
        date: currentDate
    });

    if (!existingAttendance || !existingAttendance.checkInTime) {
        return next(new AppError("You have not checkedIn for today", 400));
    }
    if (existingAttendance.checkOutTime) {
        return next(new AppError("You have already checkedOut for today", 400));
    }

    const checkInTime = existingAttendance.checkInTime;
    const checkOutTime = Date.now();
    const workHoursMillis = checkOutTime - checkInTime;

    const totalMinutes = Math.floor(workHoursMillis / (1000 * 60));
    console.log(totalMinutes)
    const hours = Math.floor(totalMinutes / 60); // Calculate total hours
    const minutes = totalMinutes % 60; // Calculate remaining minutes

    const checkedOut = await Attendance.findByIdAndUpdate(existingAttendance._id, {
        checkOutTime: checkOutTime,
        workHoursAndMinutes: `${hours} hours ${minutes} minutes`,
        notes: "CheckedOut Successfully"
    });

    if (!checkedOut) {
        return next(new AppError("Something went wrong while CheckOut the employee", 500));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: checkedOut
        }
    });
});

exports.getCurrentUserAttendance = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.user?.id);
    if (!employee) {
        return next(new AppError("Employee not found or not LoggedIn", 404));
    }
    const allAttendance = await Attendance.find({ employee: employee._id });
    if (!allAttendance || allAttendance.length === 0) {
        return next(new AppError(`No Attendance found for Name: ${employee.firstname} `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: allAttendance
        }
    });
})

exports.getAttendanceByEmployeeId = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.params.id);
    if (!employee) {
        return next(new AppError("Employee ID Invalid. Enter valid Employee ID", 404));
    }
    const attendance = await Attendance.find({ employee: employee._id });
    if (!attendance || attendance.length === 0) {
        return next(new AppError(`No Attendance found for Name: ${employee.firstname} `, 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: attendance
        }
    });
})