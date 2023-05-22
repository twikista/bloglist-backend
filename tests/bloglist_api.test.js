const mongoose = require("mongoose");
const supertest = require("supertest");
const testHelper = require("./test_helper");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

describe("blog route is protected", () => {
  let auth = {};
  beforeAll(async () => {
    const credentials = { username: "fingy", password: "123456" };
    const response = await api
      .post("/api/login")
      .send(credentials)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    auth.token = response.body.token;
  }, 100000);

  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = testHelper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((i) => i.save());
    await Promise.all(promiseArray);
  }, 100000);

  describe("all blogs", () => {
    test("can be viewed by authenticated user", async () => {
      const blogsAtStart = await testHelper.blogsInDB();

      const response = await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${auth.token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      expect(response.body).toHaveLength(blogsAtStart.length);
    });

    test("viewed by authenticated user are returned in JSON format", async () => {
      await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${auth.token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });
  });

  describe("single blog", () => {
    test("viewed by authenticated user must have uniquie identifier named 'id'", async () => {
      const response = await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${auth.token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      response.body.forEach((item) => {
        expect(item.id).toBeDefined();
      });
    });
  });

  describe("adding a blog", () => {
    test("is successful if user is authenticated", async () => {
      const newBlog = {
        title: "First class tests",
        author: "Pascal Milton",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
      };
      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogs = await testHelper.blogsInDB();
      const authors = blogs.map((i) => i.author);

      expect(blogs).toHaveLength(testHelper.initialBlogs.length + 1);
      expect(authors).toContain("Pascal Milton");
    });

    test("sets 'likes' property to Zero if not specified", async () => {
      const newBlog = {
        title: "Test for likes property",
        author: "Fullstack Open",
        url: "http://blog.viro.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogs = await testHelper.blogsInDB();
      const lastBlogAdded = blogs.at(-1);
      expect(lastBlogAdded.likes).toBe(0);
    });

    test("fails with status code 400 if title is not specified", async () => {
      const newBlog = {
        author: "Golon",
        url: "http://blog.viro.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 8,
      };
      await api
        .post("/api/blogs")
        .set("AUthorization", `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(400);

      const blogs = await testHelper.blogsInDB();

      expect(blogs).toHaveLength(testHelper.initialBlogs.length);
    });
  });

  //   test("a specifmust have uniquie identifier named 'id'", async () => {
  //     const response = await api.get("/api/blogs");
  //     response.body.forEach((item) => {
  //       expect(item.id).toBeDefined();
  //     });
  //   });
  // });

  // test("authenticated user can add a blog", async () => {
  //   const newBlog = {
  //     title: "First class tests",
  //     author: "Pascal Milton",
  //     url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
  //     likes: 10,
  //   };
  //   await api
  //     .post("/api/blogs")
  //     .set("Authorization", `Bearer ${auth.token}`)
  //     .send(newBlog)
  //     .expect(201)
  //     .expect("Content-Type", /application\/json/);

  //   const blogs = await testHelper.blogsInDB();
  //   const authors = blogs.map((i) => i.author);

  //   expect(blogs).toHaveLength(testHelper.initialBlogs.length + 1);
  //   expect(authors).toContain("Pascal Milton");
  // });
});

// beforeEach(async () => {
//   await Blog.deleteMany({});

//   const blogObjects = testHelper.initialBlogs.map((blog) => new Blog(blog));
//   const promiseArray = blogObjects.map((i) => i.save());
//   await Promise.all(promiseArray);
// }, 100000);

// describe("with some blogs already saved", () => {
//   test("all blogs are returned in JSON format", async () => {
//     const response = await api.get("/api/blogs");
//     console.log(response.body.length);

//     expect(response.body.length).toBe(testHelper.initialBlogs.length);
//     expect(response.headers["content-type"].split(";")).toContain(
//       "application/json"
//     );
//   });
// });

// describe("viewing a specific blog", () => {
//   test("must have uniquie identifier named 'id'", async () => {
//     const response = await api.get("/api/blogs");
//     response.body.forEach((item) => {
//       expect(item.id).toBeDefined();
//     });
//   });
// });

describe("addition of a new blog", () => {
  test("succeeds with valid data", async () => {
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

  test("sets 'likes' property to Zero if not specified", async () => {
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

  test("fails with status code 400 if title is not specified", async () => {
    const newBlog = {
      author: "Golon",
      url: "http://blog.viro.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 8,
    };
    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogs = await testHelper.blogsInDB();

    expect(blogs).toHaveLength(testHelper.initialBlogs.length);
  });

  test("fails with status code 400 if url is not specified", async () => {
    const newBlog = {
      tilte: "Long Long Journey",
      author: "Galaxy",
      likes: 8,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogs = await testHelper.blogsInDB();
    expect(blogs).toHaveLength(testHelper.initialBlogs.length);
  });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id valid", async () => {
    const blogsBeforeDelete = await testHelper.blogsInDB();
    const blogToDelete = blogsBeforeDelete[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAfterDelete = await testHelper.blogsInDB();
    expect(blogsAfterDelete).toHaveLength(testHelper.initialBlogs.length - 1);
  });
});

describe("updating a blog", () => {
  test("succeeds with status code 200 if data and 'id' are valid", async () => {
    const blogsBeforeUpdate = await testHelper.blogsInDB();
    const blogToUpdate = blogsBeforeUpdate[0];
    const blog = { ...blogToUpdate, likes: 88 };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAfterUpdate = await testHelper.blogsInDB();
    const updatedBlog = blogsAfterUpdate[0];

    expect(updatedBlog.likes).not.toBe(blogToUpdate.likes);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
