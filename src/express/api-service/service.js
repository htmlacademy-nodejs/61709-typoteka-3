'use strict';

const {HttpCode} = require(`../../constants`);

class ApiService {

  constructor(api) {
    this._api = api;
  }

  async getAllArticles(activePage) {
    return await this._api.get(`/articles`, {params: {activePage}});
  }

  async getAllArticlesByUser(userId) {
    return await this._api.get(`/articles/users/${userId}`);
  }

  async getMostDiscussedArticles() {
    return await this._api.get(`/articles/comments`);
  }

  async getArticleById(articleId) {
    return await this._api.get(`/articles/${articleId}`);
  }

  async getArticleByCategory(categoryId, activePage) {
    return await this._api.get(`/articles/category/${categoryId}`, {params: {activePage}});
  }

  async deleteArticle(articleId) {
    return await this._api.delete(`/articles/${articleId}`);
  }

  async createNewArticle(articleData) {
    try {
      return await this._api.post(`/articles`, articleData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {errors, categories}} = response;
        return {
          validationError: true,
          errors,
          categories
        };
      }

      throw err;
    }
  }

  async updateArticle(articleId, articleData) {
    try {
      return await this._api.put(`/articles/${articleId}`, articleData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {errors, article, categories}} = response;

        return {
          validationError: true,
          article,
          errors,
          categories
        };
      }

      throw err;
    }
  }

  async getAllCategories() {
    return await this._api.get(`/categories`);
  }

  async getAllCategoriesWithArticlesCount() {
    return await this._api.get(`/categories/articles`);
  }

  async createNewCategory(categoryData) {
    try {
      return await this._api.post(`/categories`, categoryData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {newCategoryError, categories}} = response;

        return {
          validationError: true,
          newCategoryError,
          categories
        };
      }

      throw err;
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      return await this._api.put(`/categories/${categoryId}`, categoryData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {error, categories}} = response;

        return {
          validationError: true,
          error,
          categories
        };
      }

      throw err;
    }
  }

  async deleteCategory(categoryId) {
    return await this._api.delete(`/categories/${categoryId}`);
  }

  async searchArticles(query) {
    return await this._api.get(`/search?query=${encodeURI(query)}`);
  }

  async createComment(articleId, commentData) {
    try {
      return await this._api.post(`/articles/${articleId}/comments`, commentData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {errors, article}} = response;
        return {
          validationError: true,
          errors,
          article
        };
      }

      throw err;
    }
  }

  async deleteComment(commentId) {
    return await this._api.delete(`/articles/comments/${commentId}`);
  }

  async getLastArticlesComments() {
    return await this._api.get(`/articles/users/comments`);
  }

  async getUserArticleComments(userId) {
    return await this._api.get(`/articles/users/${userId}/comments`);
  }

  async createUser(userData) {
    try {
      return await this._api.post(`/users`, userData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {errors}} = response;
        return {
          validationError: true,
          errors
        };
      }

      throw err;
    }
  }

  async logUser(userData) {
    try {
      return await this._api.post(`/users/login`, userData);
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.BAD_REQUEST) {
        const {data: {errors}} = response;
        return {
          validationError: true,
          errors
        };
      }

      throw err;
    }
  }

  async checkUserAuth(accessToken) {
    try {
      return await this._api.post(`/users/auth`, {accessToken});
    } catch (err) {
      const {response} = err;

      if (response.status === HttpCode.UNAUTHORIZED) {
        return {
          authError: true
        };
      }

      throw err;
    }
  }

}

module.exports = ApiService;
