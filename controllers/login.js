const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });
  const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
  if (!(user && passwordCorrect)) {
    return response.status(400).json({ error: "invalid username or password" });
  }

  const userForToken = { user: user.username, id: user._id };
  const token = jwt.sign(userForToken, process.env.SECRET);

  response
    .status(200)
    .json({ username: user.username, name: user.name, token });
});

module.exports = loginRouter;
