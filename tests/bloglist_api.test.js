const mongoose = require("mongoose");
const supertest = require("supertest");
const testHelper = require("./test_helper");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");

// const initialBlogs = [
//   {
//     title: "React patterns",
//     author: "Michael Chan",
//     url: "https://reactpatterns.com/",
//     likes: 7,
//   },
//   {
//     title: "Go To Statement Considered Harmful",
//     author: "Edsger W. Dijkstra",
//     url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
//     likes: 5,
//   },
//   {
//     title: "First class tests",
//     author: "Robert C. Martin",
//     url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
//     likes: 10,
//   },
// ];

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = testHelper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((i) => i.save());
  await Promise.all(promiseArray);

  // let blogObject = new Blog(testHelper.initialBlogs[0]);
  // await blogObject.save();

  // blogObject = new Blog(testHelper.initialBlogs[1]);
  // await blogObject.save();

  // blogObject = new Blog(testHelper.initialBlogs[2]);
  // await blogObject.save();
}, 100000);

test("there are 3 blogs in JSON format", async () => {
  const response = await api.get("/api/blogs");
  console.log(response.body.length);

  expect(response.body.length).toBe(testHelper.initialBlogs.length);
  expect(response.headers["content-type"].split(";")).toContain(
    "application/json"
  );
});

test("blog posts to have uniquie identifier named 'id'", async () => {
  const response = await api.get("/api/blogs");
  response.body.forEach((item) => {
    expect(item.id).toBeDefined();
  });
});

test("valid blog can be added", async () => {
  const newBlog = {
    title: "First class tests",
    author: "Pascal Milton",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  };
  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogs = await testHelper.blogsInDB();
  const authors = blogs.map((i) => i.author);

  expect(blogs).toHaveLength(testHelper.initialBlogs.length + 1);
  expect(authors).toContain("Pascal Milton");
});

test("set likes property to Zero if missing from request", async () => {
  const newBlog = {
    title: "Test for likes property",
    author: "Fullstack Open",
    url: "http://blog.viro.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogs = await testHelper.blogsInDB();
  const lastBlogAdded = blogs.at(-1);
  expect(lastBlogAdded.likes).toBe(0);
});

test("blog without title is not added", async () => {
  const newBlog = {
    author: "Golon",
    url: "http://blog.viro.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 8,
  };
  await api.post("/api/blogs").send(newBlog).expect(400);

  const blogs = await testHelper.blogsInDB();

  expect(blogs).toHaveLength(testHelper.initialBlogs.length);
});

test("blog without url is not added", async () => {
  const newBlog = {
    tilte: "Long Long Journey",
    author: "Galaxy",
    likes: 8,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const blogs = await testHelper.blogsInDB();
  expect(blogs).toHaveLength(testHelper.initialBlogs.length);
});

afterAll(async () => {
  await mongoose.connection.close();
});
