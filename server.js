/* eslint-disable no-console */
import "./config.js";
import mongoose from "mongoose";
import app from "./app.js";

app.set("query parser", "extended"); // enables nested query parsing

// console.log(app.get("env")); // express
// console.log(process.env); // node js

// connecting DB
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLER REJECTION  Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
