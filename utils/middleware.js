const jwt = require("jsonwebtoken");
const logger = require("./logger");
const User = require("../models/user");

const requestLogger = (request, response, next) => {
  logger.info("Method:  ", request.method);
  logger.info("Path: ", request.path);
  logger.info("Body: ", request.body);
  logger.info("----");
  next();
};

const errorHandler = (error, request, response, next) => {
  // logger.error(error.message);

  if (error.name === "CastError") {
    response.status(401).json({ error: "invalid Id type" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    response.status(400).json({ error: error.message });
  }
  next();
};

const tokenExtractor = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "invalid token" });
    }

    const user = await User.findById(decodedToken.id);
    request.user = user;
    next();
  } else {
    response.status(401).json({ error: "unauthorized request" });
    next();
  }
};

module.exports = { requestLogger, errorHandler, tokenExtractor };
