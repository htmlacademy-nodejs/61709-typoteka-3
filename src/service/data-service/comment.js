'use strict';

const {sequelize} = require(`../db-config/db`);
const {Comment} = sequelize.models;
const LAST_COMMENTS_LIMIT = 4;

class CommentService {

  static async createComment(articleId, commentData) {
    return await Comment.create(commentData, {returning: true});
  }

  static async findOne(commentId) {
    return await Comment.findByPk(commentId, {returning: true});
  }

  static async deleteComment(commentId) {
    return await Comment.destroy({
      where: {id: commentId}
    });
  }

  static async findAll() {
    const comments = await Comment.findAll({
      include: [`users`],
      order: [[`createdDate`, `DESC`]],
      limit: LAST_COMMENTS_LIMIT
    });

    return comments;
  }
}

module.exports = CommentService;
