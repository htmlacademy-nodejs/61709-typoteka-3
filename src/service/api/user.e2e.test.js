'use strict';

const request = require(`supertest`);
const {getServer} = require(`../api-server`);
const {sequelize} = require(`../db-config/db`);
const {HttpCode} = require(`../../constants`);

let server;

beforeAll(async () => {
  server = await getServer();
});

afterAll(async (done) => {
  sequelize.close();
  done();
});

describe(`Create a new user tests`, () => {

  test(`Create a new user with status code 201`, async () => {
    const res = await request(server).post(`/api/users`).send({
      firstname: `Тестовый`,
      lastname: `Юзер`,
      email: `useremail${Date.now()}@mail.ru`,
      password: `12345678`,
      confirmPassword: `12345678`,
      avatar: `avatar.jpg`
    });

    expect(res.statusCode).toBe(HttpCode.CREATED);
    expect(typeof res.body).toBe(`object`);
  });

  test(`Create a new user with status code 400 (incorrect data sent)`, async () => {
    const res = await request(server).post(`/api/users`).send({
      lastname: `Юзер`,
      email: `useremail${Date.now()}@mail.ru`,
      password: `12345678`,
      avatar: `avatar.jpg`
    });

    expect(res.statusCode).toBe(HttpCode.BAD_REQUEST);
  });

  test(`Create a new user with the same email status code 400 (incorrect data sent)`, async () => {
    const usersData = await request(server).get(`/api/users`);
    const user = usersData.body[0];
    const res = await request(server).post(`/api/users`).send({
      firstname: `Тестовый`,
      lastname: `Юзер`,
      email: user.email,
      password: `12345678`,
      confirmPassword: `12345678`,
      avatar: `avatar.jpg`
    });

    expect(res.statusCode).toBe(HttpCode.BAD_REQUEST);
  });
});

describe(`Login user test`, () => {

  test(`Login user with status code 200`, async () => {
    const usersData = await request(server).get(`/api/users`);
    const user = usersData.body[usersData.body.length - 1];

    const res = await request(server).post(`/api/users/login`).send({
      email: user.email,
      password: `12345678`
    });

    expect(res.statusCode).toBe(HttpCode.SUCCESS);
  });

  test(`Login user with status code 400 (incorrect data sent)`, async () => {
    const usersData = await request(server).get(`/api/users`);
    const user = usersData.body[0];
    const res = await request(server).post(`/api/users/login`).send({
      email: user.email,
      password: `123456`
    });

    expect(res.statusCode).toBe(HttpCode.BAD_REQUEST);
  });

  test(`Create a new user with unexistable email status code 400 (incorrect data sent)`, async () => {
    const res = await request(server).post(`/api/users/login`).send({
      email: `test@email.com`,
      password: `12345678`,
    });

    expect(res.statusCode).toBe(HttpCode.BAD_REQUEST);
  });
});
