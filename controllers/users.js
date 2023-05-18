const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

//create user
usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

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
  const users = await User.find({});
  response.status(200).json(users);
});

module.exports = usersRouter;
