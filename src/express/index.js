'use strict';

const http = require(`http`);
const ioSocket = require(`socket.io`);
const path = require(`path`);
const express = require(`express`);
const chalk = require(`chalk`);
const cookieParser = require(`cookie-parser`);

const ApiService = require(`./api-service/service`);
const {createAPI} = require(`./axios-api`);
const checkAuth = require(`./check-auth`);

const {
  getArticlesRouter,
  getCategoriesRouter,
  getMainRouter,
  getMyRouter
} = require(`./routes`);

const {
  PUBLIC_DIR,
  DefaultPort,
  HttpCode
} = require(`../constants`);

const service = new ApiService(createAPI());
const app = express();
const server = http.createServer(app);
const io = ioSocket(server);

app.use(express.static(path.resolve(__dirname, PUBLIC_DIR)));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.use(checkAuth(service));
app.use(`/`, getMainRouter(service));
app.use(`/articles`, getArticlesRouter(service));
app.use(`/my`, getMyRouter(service));
app.use(`/categories`, getCategoriesRouter(service));

app.set(`io`, io);
app.use((req, res) => res.status(HttpCode.NOT_FOUND).render(`errors/404`));
app.use((err, req, res, next) => {

  if (err) {
    console.error(chalk.red(err));

    if (err.response && err.response.status === HttpCode.NOT_FOUND) {
      res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    } else {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
    }
  }

  return next();
});

io.on(`connection`, (socket) => {
  socket.on(`disconnect`, () => {
    console.info(chalk.green(`Client disconnected!`));
  });
});

server.listen(DefaultPort.FRONT_SERVER, () => {
  console.info(chalk.green(`Server is running on port: ${DefaultPort.FRONT_SERVER}`));
});

