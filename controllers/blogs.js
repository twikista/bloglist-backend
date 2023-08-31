const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')
const User = require('../models/user')
const Comment = require('../models/comment')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
    .populate('comments')
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)
    .populate('user', { username: 1, name: 1 })
    .populate('comments')
  response.status(200).json(blog)
})

blogRouter.post('/', middleware.tokenExtractor, async (request, response) => {
  const user = request.user

  const blog = request.body.likes
    ? new Blog({ ...request.body, user: user.id })
    : new Blog({ ...request.body, likes: 0, user: user.id })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete(
  '/:id',
  middleware.tokenExtractor,
  async (request, response) => {
    const user = request.user

    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    if (blog.user.toString() === user.id.toString()) {
      await Blog.findByIdAndRemove(blogId)
      console.log(`user id: ${user.id}`)
      console.log(`blog id: ${blog._id}`)
      User.updateOne(
        {},
        { $pull: { blogs: blog._id.toString() } },
        { multi: true }
      )
      response.status(204).end()
    } else {
      return response.status(403).json({ error: 'unauthorized' })
    }
  }
)

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const blogUpdateData = request.body

  // const user = request.user
  // const blog = await Blog.findById(id)

  // if (user.id.toString() === blog.user.toString()) {
  //   const updatedBlog = await Blog.findByIdAndUpdate(id, blogUpdateData, {
  //     new: true,
  //   })
  //   response.status(200).json(updatedBlog)
  // } else {
  //   return response.status(403).json({ error: 'unauthorized' })
  // }

  const updatedBlog = await Blog.findByIdAndUpdate(id, blogUpdateData, {
    new: true,
  })
  if (!updatedBlog) {
    return response
      .status(500)
      .json({ error: 'request could not be processed' })
  }
  response.status(200).json(updatedBlog)
})

blogRouter.post('/:id/comments', async (request, response) => {
  const blogId = request.params.id
  const commentText = request.body.text

  const comment = new Comment({
    text: commentText,
    blog: blogId,
  })
  const savedComment = await comment.save()

  const blogCommentedOn = await Blog.findById(blogId)
  blogCommentedOn.comments = blogCommentedOn.comments.concat(savedComment._id)
  await blogCommentedOn.save()

  response.status(201).json(savedComment)
})

module.exports = blogRouter
