const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post("/", async (request, response, next) => {
  const blog = request.body.like
    ? new Blog({ ...request.body })
    : new Blog({ ...request.body, likes: 0 });
  const result = await blog.save();
  response.status(201).json(result);
});

blogRouter.delete("/:id", async (request, response) => {
  const { id } = request.params;
  await Blog.findByIdAndRemove(id);
  response.status(204).end();
});

blogRouter.put("/:id", async (request, response) => {
  const id = request.params.id;
  const blog = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
  response.status(200).json(updatedBlog);
});

module.exports = blogRouter;
