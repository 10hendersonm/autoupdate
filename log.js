const chalk = require('chalk')
const util = require('util')
const { name } = require('./package.json')

const format = (...msg) => `[${chalk.green(name)}] ${util.format(...msg)}`

module.exports = {
  format,
}
