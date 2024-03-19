const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const empSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Firstname is required'],
        index: true,
        lowercase: true
    },
    lastname: {
        type: String,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    profileImage: {
        type: String // Cloudinary URL
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 5,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm Password is required'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Both passwords are not same"
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]{3,30}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid Password!`,
        }
    },
    role: {
        type: String,
        enum: ['Employee', 'HR', 'Admin'],
        default: "Employee"
    },
    favourite: {
        type: Boolean,
        default: false
    },
    dob: {
        type: Date,
        required: true
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
})

empSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
})

empSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

empSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

empSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        return JWTTimeStamp < changedTimestamp
    }
}

empSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

const Employee = mongoose.model('Employee', empSchema);
module.exports = Employee

