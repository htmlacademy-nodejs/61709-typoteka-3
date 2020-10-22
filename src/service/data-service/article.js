'use strict';

const {sequelize} = require(`../db-config/db`);
const {
  Article,
  Comment,
  articlesCategories,
  Category
} = sequelize.models;
const POPULAR_ARTICLES_LIMIT = 4;
const ARTICLES_LIMIT = 8;
const countOffset = (limit, activePage) => limit * (activePage - 1);

class ArticleService {

  static async findAll(activePage) {
    const offset = countOffset(ARTICLES_LIMIT, activePage);
    const articles = await Article.findAll({
      include: [`categories`, `comments`],
      limit: ARTICLES_LIMIT,
      order: [[`createdDate`, `DESC`]],
      offset
    });

    const articlesCount = await Article.count();

    return {
      articles,
      articlesCount
    };
  }

  static async findAllByUser(userId) {
    const userArticles = await Article.findAll({
      where: {userId}
    });

    return userArticles;
  }

  static async createArticle(articleData) {
    const newArticle = await Article.create(articleData, {returning: true});
    await newArticle.addCategories(articleData.categories);
    return newArticle;
  }

  static async updateArticle(articleId, articleData) {
    const [updateResult, [updatedArticle]] = await Article.update(articleData, {
      where: {id: articleId},
      returning: true
    });

    if (!updateResult) {
      throw Error(`Article is not updated: ${articleId}`);
    }

    await articlesCategories.destroy({where: {articleId}});
    await updatedArticle.addCategories(articleData.categories);

    return updatedArticle;
  }

  static async deleteArticle(articleId) {
    return await Article.destroy({where: {id: articleId}});
  }

  static async findMostDiscussedArticles() {

    const offers = await Article.findAll({
      attributes: [`id`, `announce`, [sequelize.fn(`count`, sequelize.col(`comments.articleId`)), `commentsCount`]],
      include: [
        {
          model: Comment,
          as: `comments`,
          attributes: [],
          required: true,
          duplicating: false
        }
      ],
      group: [`Article.id`],
      order: sequelize.literal(`"commentsCount" DESC`),
      limit: POPULAR_ARTICLES_LIMIT
    });

    return offers;
  }

  static async findOne(articleId) {
    const article = await Article.findByPk(articleId, {
      include: [
        `categories`,
        {
          model: Comment,
          as: `comments`,
          include: [`users`]
        }
      ],
      order: sequelize.literal(`"comments"."createdDate" DESC`)
    });

    return article;
  }

  static async findArticlesByCategory(categoryId, activePage) {
    const offset = countOffset(ARTICLES_LIMIT, activePage);
    const activeCategory = await Category.findByPk(categoryId);
    const articlesCount = await activeCategory.countArticles();
    const articles = await activeCategory.getArticles({
      include: [`categories`, `comments`],
      limit: ARTICLES_LIMIT,
      offset
    });

    return {
      activeCategory,
      articles,
      articlesCount
    };
  }

  static async findAllByUser(userId) {
    return await Article.findAll({
      where: {userId},
      order: [[`createdDate`, `DESC`]]
    });
  }

  static async findUserArticlesWithComments(userId) {
    return await Article.findAll({
      where: {userId},
      include: [
        {
          model: Comment,
          as: `comments`,
          include: [`users`],
        }
      ],
      order: sequelize.literal(`"comments"."createdDate" DESC`)
    });
  }
}

module.exports = ArticleService;
