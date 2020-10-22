'use strict';

const {Sequelize} = require(`sequelize`);
const {getLogger} = require(`../logger`);
const logger = getLogger();
const {ExitCode} = require(`../../constants`);
require(`dotenv`).config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    }
);

const ArticleModel = require(`./models/article`);
const CategoryModel = require(`./models/category`);
const CommentModel = require(`./models/comment`);
const UserModel = require(`./models/user`);

const models = {
  Article: ArticleModel.init(sequelize, Sequelize),
  Category: CategoryModel.init(sequelize, Sequelize),
  Comment: CommentModel.init(sequelize, Sequelize),
  User: UserModel.init(sequelize, Sequelize)
};

Object.values(models)
  .forEach((model) => model.associate(models));

const initDB = async () => {
  try {
    await sequelize.sync({force: true});
    console.info(`DB structure has been created`);
  } catch (err) {
    logger.error(`DB init failed with error: ${err}`);
    process.exit(ExitCode.ERROR);
  }
};

const connectDB = async () => {
  try {
    logger.debug(`Connecting to DB...`);
    await sequelize.authenticate();
    logger.info(`Connection success!`);
  } catch (err) {
    logger.error(`Connection failed with error: ${err}`);
    process.exit(ExitCode.ERROR);
  }
};

module.exports = {
  connectDB,
  sequelize,
  initDB
};
