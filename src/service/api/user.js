'use strict';

const util = require(`util`);
const {Router} = require(`express`);
const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);
const {newUserFormFieldsRules, loginUserFormFieldsRules} = require(`../form-validation`);
const {validateForm, validateFormByFields, generateTokens} = require(`../../utils`);
const {HttpCode, UserRole} = require(`../../constants`);
const saltRounds = 10;

const jwtVerify = util.promisify(jwt.verify);

const getUserRouter = (UserService) => {
  const userRouter = new Router();

  userRouter.get(`/`, async (req, res) => {
    const users = await UserService.findAll();
    return res.status(HttpCode.SUCCESS).json(users);
  });

  userRouter.post(`/`, ...newUserFormFieldsRules, async (req, res) => {
    const errors = {
      errorsList: validateForm(req),
      errorByField: validateFormByFields(req)
    };
    let userData = {...req.body};

    const user = await UserService.findUserByEmail(userData.email);

    if (user) {
      errors.errorsList.push(`Пользователь с такой почтой ${user.email} уже существует.`);
      errors.errorByField[`email`] = {msg: `Пользователь с такой почтой ${user.email} уже существует.`};
    }

    if (errors.errorsList.length > 0) {
      return res.status(HttpCode.BAD_REQUEST).send({errors});
    }

    const usersCount = await UserService.countUsers();

    userData = {
      ...userData,
      password: await bcrypt.hash(userData.password, saltRounds),
      role: usersCount > 0 ? UserRole.READER : UserRole.ADMIN
    };

    const newUser = await UserService.createUser(userData);

    return res.status(HttpCode.CREATED).json(newUser);
  });

  userRouter.post(`/login`, ...loginUserFormFieldsRules, async (req, res) => {
    const {email, password} = req.body;
    const errors = {
      errorsList: validateForm(req),
      errorByField: validateFormByFields(req)
    };

    const user = await UserService.findUserByEmail(email);

    if (!user) {
      errors.errorsList.push(`Пользователь с такой почтой ${email} не зарегистрирован.`);
      errors.errorByField[`email`] = {msg: `Пользователь с такой почтой ${email} не зарегистрирован.`};
    }

    if (user) {
      const isPasswordsMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordsMatch) {
        errors.errorsList.push(`Неверный пароль.`);
        errors.errorByField[`password`] = {msg: `Неверный пароль.`};
      }
    }

    if (errors.errorsList.length > 0) {
      return res.status(HttpCode.BAD_REQUEST).send({errors});
    }

    const {accessToken} = generateTokens(user.id);
    return res.status(HttpCode.SUCCESS).json({accessToken, user});
  });

  userRouter.post(`/auth`, async (req, res) => {
    try {
      const {accessToken} = req.body;

      if (!accessToken) {
        return res.sendStatus(HttpCode.UNAUTHORIZED);
      }

      const jwtVerifyResult = await jwtVerify(accessToken, process.env.JWT_ACCESS_SECRET);

      const user = await UserService.findUserById(jwtVerifyResult.id);
      return res.status(HttpCode.SUCCESS).json({user});
    } catch (err) {
      return res.sendStatus(HttpCode.UNAUTHORIZED);
    }
  });

  return userRouter;

};

module.exports = {getUserRouter};
