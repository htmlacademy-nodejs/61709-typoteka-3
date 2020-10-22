'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);
const checkAuth = require(`../check-auth`);
const {RouteProtectionType} = require(`../../constants`);

const csrfProtection = csrf({cookie: true});

const getCategoriesRouter = (service) => {
  const categoriesRouter = new Router();

  categoriesRouter.get(`/`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const categories = await service.getAllCategoriesWithArticlesCount();
      return res.render(`all-categories`, {categories, csrf: req.csrfToken()});
    } catch (err) {
      return next(err);
    }
  });

  categoriesRouter.post(`/:categoryId/delete`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const {categoryId} = req.params;
      await service.deleteCategory(categoryId);

      return res.redirect(`/categories`);
    } catch (err) {
      return next(err);
    }
  });

  categoriesRouter.post(`/`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const categoryData = {...req.body};

      const createdCategory = await service.createNewCategory(categoryData);

      if (createdCategory.validationError) {
        const {newCategoryError, categories} = createdCategory;
        return res.render(`all-categories`, {newCategoryError, categories, newCategoryData: categoryData, csrf: req.csrfToken()});
      }

      return res.redirect(`/categories`);
    } catch (err) {
      return next(err);
    }
  });

  categoriesRouter.post(`/:categoryId`, csrfProtection, checkAuth(service, RouteProtectionType.FULL, true), async (req, res, next) => {
    try {
      const {categoryId} = req.params;
      const categoryData = {...req.body};

      const updatedCategory = await service.updateCategory(categoryId, categoryData);

      if (updatedCategory.validationError) {
        const {error, categories} = updatedCategory;
        return res.render(`all-categories`, {error, categories, categoryData, categoryId, csrf: req.csrfToken()});
      }

      return res.redirect(`/categories`);
    } catch (err) {
      return next(err);
    }
  });

  return categoriesRouter;
};

module.exports = {getCategoriesRouter};
