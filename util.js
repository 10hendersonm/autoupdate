const { execSync } = require('child_process')

const exec = (cmd, opts = {}) =>
  execSync(cmd, {
    stdio: 'pipe',
    encoding: 'utf-8',
    ...opts,
  })?.trim()

module.exports = { exec }
