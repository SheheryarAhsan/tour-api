/* eslint-disable no-console */
/* export default (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}; */
import AppError from "../utils/appErrors.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Invalid token, Please login again", 401);

const handleJWTExpiredError = () => new AppError("You token has expired! Please login again", 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) Rendered website
  console.log("Error😡: ", err);
  return res.status(err.statusCode).render("error", {
    title: "Something Went wrong!",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    // A) operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // B) Programming or other unkown error: dont leak error details
    // 1) log error
    console.log("Error😡: ", err);
    // 2) send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
  // B) Rendered Website
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something Went wrong!",
      msg: err.message,
    });
  }
  console.log("Error😡: ", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
};

export default (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle specific known errors

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
