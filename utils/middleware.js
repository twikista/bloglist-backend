const logger = require("./logger");

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

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
    next();
  } else {
    request.token = null;
    next();
  }
};

module.exports = { requestLogger, errorHandler, tokenExtractor };
