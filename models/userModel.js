import crypto from "crypto";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userScheme = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please tell us your name!"],
    unique: true,
    trim: true,
    maxLength: [40, "A user name must have less or equal than 40 characters"],
    minLength: [10, "A user name must have less or equal than 10 characters"],
  },
  email: {
    type: String,
    require: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // this only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  PasswordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userScheme.pre("save", async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userScheme.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userScheme.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userScheme.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userScheme.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

userScheme.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userScheme);
export default User;
