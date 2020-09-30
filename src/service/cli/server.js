'use strict';

const {DefaultPort} = require(`../../constants`);
const {getServer} = require(`../api-server`);

module.exports = {
  name: `--server`,
  async run(customPort) {
    const port = Number.parseInt(customPort, 10) || DefaultPort.SERVICE_SERVER;
    await getServer(port);
  }
};
