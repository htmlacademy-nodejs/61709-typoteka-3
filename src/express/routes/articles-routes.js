'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);
const {fileUploader} = require(`../file-uploader`);
const upload = fileUploader.single(`picture`);
const checkAuth = require(`../check-auth`);
const {RouteProtectionType} = require(`../../constants`);

const csrfProtection = csrf({cookie: true});

const getArticlesRouter = (service) => {

  const articlesRouter = new Router();

  articlesRouter.get(`/category/:id`, async (req, res, next) => {
    try {
      const activePage = parseInt(req.query.page, 10) || 1;
      const categoryId = req.params.id;
      const {
        activeCategory,
        articles,
        articlesCount,
        pagesCount
      } = await service.getArticleByCategory(categoryId, activePage);
      const categories = await service.getAllCategoriesWithArticlesCount();

      return res.render(`articles-by-category`, {
        activeCategory,
        articles,
        categories,
        activePage,
        articlesCount,
        pagesCount,
        template: `articles-by-category`
      });
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.get(`/add`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const categories = await service.getAllCategories();
      return res.render(`article-new`, {categories, csrf: req.csrfToken()});
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.post(`/add`, checkAuth(service, RouteProtectionType.FULL, true), upload, csrfProtection, async (req, res, next) => {
    try {
      const file = req.file;
      const user = req.user;
      let articleData = {...req.body};

      articleData = {
        ...articleData,
        picture: file ? file.filename : null,
        userId: user.id
      };

      const articleCreationResult = await service.createNewArticle(articleData);

      if (articleCreationResult.validationError) {
        const {errors, categories} = articleCreationResult;
        return res.render(`article-new`, {errors, categories, articleData, csrf: req.csrfToken()});
      }

      return res.redirect(`/my`);
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.post(`/edit/:articleId`, checkAuth(service, RouteProtectionType.FULL, true), upload, csrfProtection, async (req, res, next) => {
    try {
      const {articleId} = req.params;
      const file = req.file;
      const user = req.user;
      let articleData = {...req.body};

      articleData = {
        ...articleData,
        picture: file ? file.filename : null,
        userId: user.id
      };

      const articleUpdateResult = await service.updateArticle(articleId, articleData);

      if (articleUpdateResult.validationError) {
        const {errors, article, categories} = articleUpdateResult;
        return res.render(`article-edit`, {
          errors,
          article,
          categories,
          articleData: {...articleData, categories: articleData.categories ? articleData.categories : []},
          csrf: req.csrfToken()
        });
      }

      return res.redirect(`/my`);
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.get(`/edit/:id`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const articleId = req.params.id;
      const article = await service.getArticleById(articleId);
      const categories = await service.getAllCategories();

      return res.render(`article-edit`, {article, categories, csrf: req.csrfToken()});
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.get(`/:id`, csrfProtection, async (req, res, next) => {
    try {
      const articleId = req.params.id;
      const article = await service.getArticleById(articleId);

      return res.render(`article`, {article, csrf: req.csrfToken()});
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.post(`/:id/delete`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const articleId = req.params.id;
      await service.deleteArticle(articleId);

      return res.redirect(`/my`);
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.post(`/:id/comments`, csrfProtection, checkAuth(service, RouteProtectionType.FULL), async (req, res, next) => {
    try {
      const io = req.app.get(`io`);
      const articleId = req.params.id;
      const commentData = {...req.body, userId: req.user.id};

      const commentCreationResult = await service.createComment(articleId, commentData);

      if (commentCreationResult.validationError) {
        const {errors, article} = commentCreationResult;
        return res.render(`article`, {errors, article, commentData, csrf: req.csrfToken()});
      }

      const lastComments = await service.getLastArticlesComments();
      const mostDiscussedArticles = await service.getMostDiscussedArticles();

      io.emit(`last_comments`, lastComments);
      io.emit(`popular_articles`, mostDiscussedArticles);

      return res.redirect(`/articles/${articleId}`);
    } catch (err) {
      return next(err);
    }
  });

  articlesRouter.post(`/comments/:commentId/delete`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const {commentId} = req.params;
      await service.deleteComment(commentId);

      return res.redirect(`/my/comments`);
    } catch (err) {
      return next(err);
    }
  });

  return articlesRouter;
};


module.exports = {getArticlesRouter};
