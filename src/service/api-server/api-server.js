'use strict';

const http = require(`http`);
const express = require(`express`);
const cookieParser = require(`cookie-parser`);
const expressPinoLogger = require(`express-pino-logger`);
const {connectDB} = require(`../db-config/db`);
const {getLogger} = require(`../logger`);

const {
  API_PREFIX,
  HttpCode,
  ExitCode
} = require(`../../constants`);

const {
  getCategoryRouter,
  getArticlesRouter,
  getSearchRouter,
  getUserRouter
} = require(`../api`);

const {
  CategoryService,
  ArticleService,
  SearchService,
  CommentService,
  UserService
} = require(`../data-service`);

const getServer = async (port) => {
  const app = express();
  const server = http.createServer(app);
  const logger = getLogger();

  await connectDB();

  app.disable(`x-powered-by`);
  app.use(expressPinoLogger(logger));
  app.use(express.json());
  app.use(cookieParser());

  app.use((req, res, next) => {
    logger.debug(`Start request to url ${req.url}`);
    next();
  });

  app.use(
      `${API_PREFIX}/categories`,
      getCategoryRouter(CategoryService)
  );

  app.use(
      `${API_PREFIX}/users`,
      getUserRouter(UserService)
  );

  app.use(
      `${API_PREFIX}/articles`,
      getArticlesRouter(
          ArticleService,
          CommentService,
          CategoryService,
          UserService
      )
  );

  app.use(
      `${API_PREFIX}/search`,
      getSearchRouter(SearchService)
  );

  app.use((req, res) => {
    const notFoundMessageText = `Not found`;

    logger.error(`End request (${req.url}) with error ${HttpCode.NOT_FOUND}.`);
    return res.status(HttpCode.NOT_FOUND)
    .json({
      error: true,
      status: HttpCode.NOT_FOUND,
      message: notFoundMessageText
    });
  });

  server.listen(port, (err) => {

    if (err) {
      logger.error(`Server error`, err);
      process.exit(ExitCode.ERROR);
    }

    return logger.info(`Server is running on port: ${port}`);
  });

  return server;
};

module.exports = {getServer};
