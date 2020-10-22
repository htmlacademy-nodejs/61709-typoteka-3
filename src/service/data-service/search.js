'use strict';

const {sequelize} = require(`../db-config/db`);
const {Article} = sequelize.models;
const {Op} = require(`sequelize`);

class SearchService {

  static async findAll(text) {
    const articles = Article.findAll({
      where: {
        title: {
          [Op.iLike]: `%${text}%`
        }
      }
    });

    return articles;
  }
}

module.exports = SearchService;
