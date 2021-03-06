'use strict';

const fs = require(`fs`).promises;
const moment = require(`moment`);
const chalk = require(`chalk`);
const jwt = require(`jsonwebtoken`);
const {validationResult} = require(`express-validator`);

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }

  return someArray;
};

const generateRandomDate = (start, end) => {
  return moment.utc(moment(start.getTime() + Math.random() * (end.getTime() - start.getTime()))).format();
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.trim().split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const readContentJSON = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);

    if (!content.trim().length) {
      return [];
    }

    return JSON.parse(content);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const convertDate = (dateToCheck) => {
  const date = moment(dateToCheck, `DD.MM.YYYY`);

  if (date.isSame(moment(), `day`, `month`, `year`)) {
    return moment.utc().format();
  }

  return moment.utc(date).format();
};

const copyObject = (obj) => JSON.parse(JSON.stringify(obj));

const formatArticleDate = (articleData) => {
  const DATE_FORMAT = `DD.MM.YYYY, HH:mm`;
  const newArticleData = copyObject(articleData);
  const makeDateFormat = (date) => moment(date).format(DATE_FORMAT);
  const makeCommentDateFormat = (comments) => {
    return comments.map((comment) => {
      comment.createdDate = makeDateFormat(comment.createdDate);
      return comment;
    });
  };

  if (Array.isArray(articleData)) {
    return newArticleData.map((article) => {
      article.createdDate = makeDateFormat(article.createdDate);

      if (article.comments && article.comments.length > 0) {
        article.comments = makeCommentDateFormat(article.comments);
      }

      return article;
    });
  }

  return {
    ...newArticleData,
    createdDate: makeDateFormat(newArticleData.createdDate),
    comments: newArticleData.comments ? makeCommentDateFormat(newArticleData.comments) : []
  };
};

const highlightArticleTitle = (articles, searchedText) => {
  const newArticleList = copyObject(articles);
  return newArticleList.map((article) => {
    const index = article.title.toLowerCase().indexOf(searchedText.toLowerCase());

    if (index !== -1) {
      article.title = `${article.title.slice(0, index)}<b>${article.title.slice(index, index + searchedText.length)}</b>${article.title.slice(index + searchedText.length)}`;
    }

    return article;
  });
};

const truncateText = (text, symbolCount) => {
  return text.length > symbolCount ? `${text.slice(0, symbolCount)}...` : text;
};

const errorsListFormatter = ({msg}) => msg;
const validateForm = (req) => validationResult(req).formatWith(errorsListFormatter).array();
const validateFormByFields = (req) => validationResult(req).mapped();

const generateTokens = (tokenData) => {
  const accessToken = jwt.sign({id: tokenData}, process.env.JWT_ACCESS_SECRET);
  const refreshToken = jwt.sign({id: tokenData}, process.env.JWT_REFRESH_SECRET);

  return {
    accessToken,
    refreshToken
  };
};

module.exports = {
  getRandomInt,
  shuffle,
  generateRandomDate,
  readContent,
  readContentJSON,
  convertDate,
  formatArticleDate,
  highlightArticleTitle,
  truncateText,
  validateForm,
  validateFormByFields,
  generateTokens
};
