'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);
const {fileUploader} = require(`../file-uploader`);
const {truncateText} = require(`../../utils`);
const checkAuth = require(`../check-auth`);
const {RouteProtectionType} = require(`../../constants`);
const upload = fileUploader.single(`avatar`);

const csrfProtection = csrf({cookie: true});

const getMainRouter = (service) => {

  const mainRouter = new Router();

  mainRouter.get(`/`, async (req, res, next) => {
    try {
      const activePage = parseInt(req.query.page, 10) || 1;
      const {
        articles,
        mostDiscussedArticles,
        articlesCount,
        pagesCount
      } = await service.getAllArticles(activePage);
      const categories = await service.getAllCategoriesWithArticlesCount();
      const lastComments = await service.getLastArticlesComments();

      return res.render(`main`, {
        articles,
        categories,
        mostDiscussedArticles,
        lastComments,
        articlesCount,
        activePage,
        pagesCount,
        template: `main`,
        truncateText
      });
    } catch (err) {
      return next(err);
    }
  });

  mainRouter.get(`/register`, csrfProtection, checkAuth(service, RouteProtectionType.SEMI), (req, res) => {
    return res.render(`register-login`, {activeTab: `register`, csrf: req.csrfToken()});
  });

  mainRouter.post(`/register`, checkAuth(service, RouteProtectionType.SEMI), upload, csrfProtection, async (req, res, next) => {
    try {
      const file = req.file;
      const userData = {...req.body};

      userData = {
        ...userData,
        avatar: file ? file.filename : null
      };

      const userCreationResult = await service.createUser(userData);

      if (userCreationResult.validationError) {
        const {errors} = userCreationResult;
        return res.render(`register-login`, {errors, userData, activeTab: `register`, csrf: req.csrfToken()});
      }

      return res.redirect(`/login`);

    } catch (err) {
      return next(err);
    }
  });

  mainRouter.get(`/login`, csrfProtection, checkAuth(service, RouteProtectionType.SEMI), (req, res) => {
    return res.render(`register-login`, {activeTab: `login`, csrf: req.csrfToken()});
  });

  mainRouter.post(`/login`, csrfProtection, checkAuth(service, RouteProtectionType.SEMI), async (req, res, next) => {
    try {
      const userData = {...req.body};
      const userLoginResult = await service.logUser(userData);

      if (userLoginResult.validationError) {
        const {errors} = userLoginResult;
        return res.render(`register-login`, {errors, userData, activeTab: `login`, csrf: req.csrfToken()});
      }

      const {accessToken, user} = userLoginResult;
      res.cookie(`auth_token`, accessToken);
      req.app.locals.user = user;
      return res.redirect(`/`);
    } catch (err) {
      return next(err);
    }

  });

  mainRouter.get(`/logout`, async (req, res) => {
    req.app.locals.user = null;
    res.clearCookie(`auth_token`);
    return res.redirect(`/login`);
  });

  mainRouter.get(`/search`, csrfProtection, async (req, res, next) => {
    try {
      const {query} = req.query;

      if (typeof (query) === `undefined`) {
        return res.render(`search`, {csrf: req.csrfToken()});
      }

      const articles = await service.searchArticles(query);

      return res.render(`search`, {
        articles,
        query,
        csrf: req.csrfToken()
      });
    } catch (err) {
      return next(err);
    }
  });

  return mainRouter;
};


module.exports = {getMainRouter};
