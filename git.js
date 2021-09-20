// Circular dependency avoidance:
const config = () => require('./config')

const { exec } = require('./util')

const getRemoteBranch = () =>
  exec('git rev-parse --abbrev-ref --symbolic-full-name @{u}')
const getBranch = () => exec('git rev-parse --abbrev-ref HEAD')

const getRemoteCommits = () => {
  const { GIT_REMOTE, GIT_BRANCH } = config().current
  return exec(`git log ${GIT_BRANCH}..${GIT_REMOTE}/${GIT_BRANCH} --oneline`)
}

const fetchRemoteBranch = () => {
  const { GIT_REMOTE, GIT_BRANCH } = config().current
  return exec(`git fetch ${GIT_REMOTE} ${GIT_BRANCH}`)
}

const pullRemoteBranch = () => {
  const { GIT_REMOTE, GIT_BRANCH } = config().current

  return exec(`git pull ${GIT_REMOTE} ${GIT_BRANCH} --rebase`)
}

module.exports = {
  getRemoteBranch,
  getBranch,
  getRemoteCommits,
  fetchRemoteBranch,
  pullRemoteBranch,
}
