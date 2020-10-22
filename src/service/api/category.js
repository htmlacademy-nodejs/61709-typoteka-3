'use strict';

const {Router} = require(`express`);
const {newCategoryFormFieldsRules} = require(`../form-validation`);
const {validateFormByFields} = require(`../../utils`);
const {checkParamIsInteger} = require(`../middlewares/param-validator`);
const {HttpCode} = require(`../../constants`);

const getCategoryRouter = (CategoryService) => {
  const categoryRouter = new Router();

  categoryRouter.get(`/`, async (req, res) => {
    const categories = await CategoryService.findAllWithArticlesCount();
    return res.status(HttpCode.SUCCESS).json(categories);
  });

  categoryRouter.delete(`/:categoryId`, checkParamIsInteger, async (req, res) => {
    const {categoryId} = req.params;
    const category = await CategoryService.findCategoryById(categoryId);

    if (!category) {
      return res.status(HttpCode.NOT_FOUND)
      .json({
        error: true,
        status: HttpCode.NOT_FOUND,
        message: `Category doesn't exist`
      });
    }

    const articlesCount = await category.countArticles();

    if (articlesCount > 0) {
      return res.status(HttpCode.SUCCESS).json(category);
    }

    const deletedCategory = await CategoryService.delete(categoryId);

    return res.status(HttpCode.SUCCESS).json(deletedCategory);
  });

  categoryRouter.post(`/`, ...newCategoryFormFieldsRules, async (req, res) => {
    const categoryData = {...req.body};
    const newCategoryError = validateFormByFields(req);

    if (Object.keys(newCategoryError).length > 0) {
      const categories = await CategoryService.findAll();
      return res.status(HttpCode.BAD_REQUEST).json({
        categories,
        newCategoryError
      });
    }

    const newCategory = await CategoryService.create(categoryData);
    return res.status(HttpCode.CREATED).json(newCategory);
  });

  categoryRouter.put(`/:categoryId`, checkParamIsInteger, ...newCategoryFormFieldsRules, async (req, res) => {
    const {categoryId} = req.params;
    const categoryData = {...req.body};
    const error = validateFormByFields(req);
    const isCategoryExist = await CategoryService.findCategoryById(categoryId);

    if (!isCategoryExist) {
      return res.status(HttpCode.NOT_FOUND).json({
        error: true,
        status: HttpCode.NOT_FOUND,
        message: `Category with id ${categoryId} not found`
      });
    }

    if (Object.keys(error).length > 0) {
      const categories = await CategoryService.findAllWithArticlesCount();
      return res.status(HttpCode.BAD_REQUEST).json({
        categories,
        error
      });
    }

    const updatedCategory = await CategoryService.updateCategory(categoryId, categoryData);
    return res.status(HttpCode.SUCCESS).json(updatedCategory);
  });

  categoryRouter.get(`/articles`, async (req, res) => {
    const categories = await CategoryService.findAllWithArticlesCount();
    return res.status(HttpCode.SUCCESS).json(categories);
  });

  return categoryRouter;

};

module.exports = {getCategoryRouter};
