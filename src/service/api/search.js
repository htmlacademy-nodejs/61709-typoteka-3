'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const {
  formatArticleDate,
  highlightArticleTitle
} = require(`../../utils`);

const getSearchRouter = (SearchService) => {

  const searchRouter = new Router();

  searchRouter.get(`/`, async (req, res) => {
    const {query} = req.query;

    if (typeof (query) === `undefined`) {
      return res.status(HttpCode.BAD_REQUEST)
      .json({
        error: true,
        status: HttpCode.BAD_REQUEST,
        message: `Invalid data sent`
      });
    }

    const searchedArticles = await SearchService.findAll(query);
    return res.status(HttpCode.SUCCESS).json(
        highlightArticleTitle(formatArticleDate(searchedArticles), query)
    );
  });

  return searchRouter;
};

module.exports = {getSearchRouter};
