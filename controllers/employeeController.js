const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/employeeModel');
const sendEmail = require('./../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        secure: true,
        httpOnly: true,
    };
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        dob: req.body.dob,
        phone: req.body.phone,
        email: req.body.email,
        favourite: req.body.favourite,
        role: req.body.role,

        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    console.log(req.body.dob);
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password required', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password'), 401);
    }

    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    if (!req.body.email) {
        return next(new AppError("Please enter your email"))
    }
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError("Their is no user with this email address", 404))
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/employee/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new AppErro("There was an error sending the mail. Try again later"), 500)
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetToken: { $gt: Date.now() } })

    // 2] If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expires'), 400)
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3] Update changedPasswordAt property for the user

    // 4] Log the user in, send JWT
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Incorrect current password', 401))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exists'))
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again', 401))
    }

    req.user = currentUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }

        next();
    };
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update. Please use /updatePassword', 400))
    }
    const filteredBody = filterObj(req.body, 'firstname', 'lastname', 'dob', 'phone', 'email', 'favourite')

    if (req.email !== req.body.email) {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            return next(new AppError('Email already exists', 400))
        }
    }
    if (req.phone !== req.body.phone) {
        const user = await User.findOne({ phone: req.body.phone })
        if (user) {
            return next(new AppError('Phone number already exists', 400))
        }
    }
    if (req.file) filteredBody.profileImage = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

// exports.todayBirthday = catchAsync(async (req, res, next) => {

// })