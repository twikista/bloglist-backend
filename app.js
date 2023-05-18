const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const middleware = require("./utils/middleware");
const blogRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");

const uri = config.MONGODB_URI;

mongoose.connect(uri).then(() => {
  console.log("connected to mongoDB");
});

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use("/api/blogs", blogRouter);
app.use("/api/users", usersRouter);
app.use(middleware.errorHandler);
module.exports = app;
