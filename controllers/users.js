const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

//create user
usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "password must have a minimum length of 3 characters long",
    });
  }

  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(password, saltRound);

  const user = new User({
    username,
    hashedPassword,
    name,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

//get all users
usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.status(200).json(users);
});

module.exports = usersRouter;
