'use strict';

const {sequelize} = require(`../db-config/db`);
const {User} = sequelize.models;

class UserService {

  static async createUser(userData) {
    return await User.create(userData, {returning: true});
  }

  static async findAll() {
    return await User.findAll();
  }

  static async countUsers() {
    return await User.count();
  }

  static async findUserById(userId) {
    return await User.findByPk(userId);
  }

  static async findUserByEmail(email) {
    return await User.findOne({where: {email}});
  }

}

module.exports = UserService;
