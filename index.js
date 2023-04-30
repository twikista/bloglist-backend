const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const blogRouter = require("./controllers/blogs");

const uri =
  "mongodb+srv://twikista:throwaykey007@cluster0.cxggszr.mongodb.net/bloglist?retryWrites=true&w=majority";

mongoose.connect(uri).then(() => {
  console.log("connected to mongoDB");
});

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRouter);

// app.get("/api/blogs", (request, response) => {
//   Blog.find({}).then((blogs) => {
//     response.json(blogs);
//   });
// });

// app.post("/api/blogs", (request, response) => {
//   const blog = new Blog({ ...request.body });
//   blog.save().then((result) => {
//     response.status(201).json(result);
//   });
// });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
