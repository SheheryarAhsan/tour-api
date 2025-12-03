/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Tour from "../../models/tourModel.js";
import User from "../../models/userModel.js";
import Review from "../../models/reviewModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: "./config.env" });

// console.log(app.get("env")); // express
// console.log(process.env); // node js

// connecting DB
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

// Import data to Database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data Successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
