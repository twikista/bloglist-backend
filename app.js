const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const blogRouter = require("./controllers/blogs");

const uri = config.MONGODB_URI;

mongoose.connect(uri).then(() => {
  console.log("connected to mongoDB");
});

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRouter);

module.exports = app;
