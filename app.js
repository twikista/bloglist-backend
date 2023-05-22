require("dotenv").config();
const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const middleware = require("./utils/middleware");
const blogRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

const uri = config.MONGODB_URI;

mongoose.connect(uri).then(() => {
  console.log("connected to mongoDB");
});

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
// app.use(middleware.tokenExtractor);
app.use("/api/blogs", middleware.tokenExtractor, blogRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use(middleware.errorHandler);
module.exports = app;
