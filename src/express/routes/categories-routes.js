'use strict';

const {Router} = require(`express`);

const getCategoriesRouter = () => {
  const categoriesRouter = new Router();

  categoriesRouter.get(`/`, (req, res) => res.render(`all-categories`));

  return categoriesRouter;
};

module.exports = {getCategoriesRouter};
