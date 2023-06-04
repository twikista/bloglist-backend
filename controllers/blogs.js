const jwt = require("jsonwebtoken");
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const middleware = require("../utils/middleware");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogRouter.post("/", middleware.tokenExtractor, async (request, response) => {
  // console.log("i am starting");
  // const token = jwt.verify(request.token, process.env.SECRET);
  // if (!token.id) {
  //   return response.status(401).json({ error: "invalid token" });
  // }
  // console.log(token);
  // const { id } = token;
  const user = request.user;

  const blog = request.body.likes
    ? new Blog({ ...request.body, user: user.id })
    : new Blog({ ...request.body, likes: 0, user: user.id });
  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogRouter.delete(
  "/:id",
  middleware.tokenExtractor,
  async (request, response) => {
    // const token = jwt.verify(request.token, process.env.SECRET);
    // if (!token.id) {
    //   return response.status(401).json({ error: "invalid token" });
    // }
    const user = request.user;

    const blogId = request.params.id;
    const blog = await Blog.findById(blogId);
    if (blog.user.toString() === user.id.toString()) {
      await Blog.findByIdAndRemove(blogId);
      response.status(204).end();
    } else {
      return response.status(403).json({ error: "unauthorized" });
    }
  }
);

blogRouter.put("/:id", middleware.tokenExtractor, async (request, response) => {
  const id = request.params.id;
  const blogUpdateData = request.body;

  const user = request.user;
  const blog = await Blog.findById(id);

  if (user.id.toString() === blog.user.toString()) {
    const updatedBlog = await Blog.findByIdAndUpdate(id, blogUpdateData, {
      new: true,
    });
    response.status(200).json(updatedBlog);
  } else {
    return response.status(403).json({ error: "unauthorized" });
  }
});

module.exports = blogRouter;
