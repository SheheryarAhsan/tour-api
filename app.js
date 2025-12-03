import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";
// import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
// import hpp from "hpp";

import AppError from "./utils/appErrors.js";
import globalErrorHandler from "./controllers/errorController.js";
import tourRouter from "./routes/tourRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import viewRouter from "./routes/viewRoutes.js";

// Recreating __filename & __dirname in ES modules
const fileURL = import.meta.url; // get the file URL of the current module
const __filename = fileURLToPath(fileURL); // convert that URL into a normal file system path
const __dirname = path.dirname(__filename); // get the directory name from path

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

/* Global Middlewares */
// Serving static files
app.use(express.static(path.join(__dirname, "public")));
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // logger
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour",
});
app.use("/api", limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
// app.use(hpp({ whitelist: ["duration", "ratingQuantity", "ratingAverage", "difficulty", "price"] }));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

/* Routing */
// mounting the routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/", viewRouter);

// handling unhandled routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

export default app;
