'use strict';

const {check} = require(`express-validator`);
const CategoryService = require(`./data-service/category`);
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MEGABYTE_IN_BYTES = 1048576;

const newArticleFormFieldsRules = [
  check(`title`)
    .trim()
    .notEmpty()
    .escape()
    .withMessage(`Введите название публикации`)
    .bail()
    .isLength({
      min: 30,
      max: 250
    })
    .withMessage(`Заголовок должен содержать от 30 до 250 символов`),
  check(`createdDate`)
    .notEmpty()
    .withMessage(`Введите дату`)
    .bail()
    .custom((value) => {
      const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{4}$/;
      return dateRegex.test(value);
    })
    .withMessage(`Неверный формат даты`),
  check(`categories`, `Выберите минимум одну категорию для публикации`)
    .exists()
    .bail()
    .toArray()
    .isLength({min: 1}),
  check(`announce`)
    .trim()
    .notEmpty()
    .escape()
    .withMessage(`Введите описание публикации`)
    .bail()
    .isLength({
      min: 30,
      max: 250
    })
    .withMessage(`Анонс должен содержать от 30 до 250 символов`),
  check(`fullText`, `Полный текст должен содержать максимум 1000 символов`)
    .trim()
    .isLength({max: 1000})
    .escape()
];

const newCategoryFormFieldsRules = [
  check(`title`)
  .trim()
    .notEmpty()
    .withMessage(`Введите название категории`)
    .bail()
    .isLength({
      min: 5,
      max: 30
    })
    .withMessage(`Название категории должно содержать от 5 до 30 символов`)
    .bail()
    .custom(async (value) => {
      const isCategoryExist = await CategoryService.findOne(value);

      if (isCategoryExist) {
        throw Error(`Категория уже существует`);
      }

      return true;
    })
];

const newCommentFormFieldsRules = [
  check(`text`)
  .trim()
    .notEmpty()
    .withMessage(`Введите текст комментария`)
    .escape()
    .bail()
    .isLength({
      min: 20
    })
    .withMessage(`Текст комментария должен содержать минимум 20 символов`)
];

const newUserFormFieldsRules = [
  check(`email`)
    .trim()
    .notEmpty()
    .withMessage(`Введите почту`)
    .bail()
    .isEmail()
    .withMessage(`Почта введена некорректно`),
  check(`firstname`)
    .trim()
    .notEmpty()
    .withMessage(`Введите имя`)
    .bail()
    .custom((value) => {
      const nameRegExp = /^[а-яА-ЯёЁa-zA-Z]+$/;
      return nameRegExp.test(value);
    })
    .withMessage(`Имя должно содержать только буквы`),
  check(`lastname`)
    .trim()
    .notEmpty()
    .withMessage(`Введите фамилию`)
    .bail()
    .custom((value) => {
      const nameRegExp = /^[а-яА-ЯёЁa-zA-Z]+$/;
      return nameRegExp.test(value);
    })
    .withMessage(`Фамилия должна содержать только буквы`),
  check(`password`)
    .trim()
    .notEmpty()
    .withMessage(`Введите пароль`)
    .bail()
    .isLength({min: 6})
    .withMessage(`Пароль должен содержать минимум 6 символов`),
  check(`confirmPassword`)
    .trim()
    .notEmpty()
    .withMessage(`Подтвердите пароль`)
    .bail()
    .isLength({min: 6})
    .withMessage(`Пароль для подтверждения должен содержать минимум 6 символов`)
    .bail()
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw Error(`Пароли не совпадают`);
      }

      return true;
    }),
  check(`avatar`)
    .trim()
    .notEmpty()
    .withMessage(`Файл не выбран. Неверный формат файла (только jpg/jpeg/png). Большой размер файла (максимально: ${MAX_FILE_SIZE / MEGABYTE_IN_BYTES} мб)`)
];

const loginUserFormFieldsRules = [
  check(`email`)
    .trim()
    .notEmpty()
    .withMessage(`Введите почту`)
    .bail()
    .isEmail()
    .withMessage(`Почта введена некорректно`),
  check(`password`)
    .trim()
    .notEmpty()
    .withMessage(`Введите пароль`)
    .bail()
    .isLength({min: 6})
    .withMessage(`Пароль должен содержать минимум 6 символов`)
];

module.exports = {
  newArticleFormFieldsRules,
  newCategoryFormFieldsRules,
  newCommentFormFieldsRules,
  newUserFormFieldsRules,
  loginUserFormFieldsRules
};
