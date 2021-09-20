const { cosmiconfigSync } = require('cosmiconfig')
const endent = require('endent').default
const chalk = require('chalk')
const { format } = require('./log')
const { getBranch, getRemoteBranch } = require('./git')

const { name } = require('./package.json')

const defaultConfig = {
  POLL_INTERVAL: {
    value: 60 * 1000,
    type: 'number',
  },
  GIT_BRANCH: {
    value: getBranch(),
    type: 'string',
  },
  GIT_REMOTE: {
    value: getRemoteBranch().replace(/\/.+$/, ''),
    type: 'string',
  },
}

const getConfig = () => {
  const { config: userConfig = {}, filepath: configFilePath } =
    cosmiconfigSync(name, {
      cache: false,
    }).search() || {}

  const defaultKeys = Object.keys(defaultConfig)
  const unrecognizedConfigKeys = Object.keys(userConfig).filter(
    (userConfigKey) => !defaultKeys.includes(userConfigKey),
  )

  if (unrecognizedConfigKeys.length) {
    throw new Error(
      format(
        endent`
          Unrecognized configuration keys in ${chalk.blue(configFilePath)}:
            ${unrecognizedConfigKeys.map((key) => chalk.blue(key)).join(', ')}
        `,
      ),
    )
  }

  return Object.entries(defaultConfig).reduce(
    (outConfig, [defaultKey, { type, value: defaultValue }]) => {
      const userConfigValue = outConfig[defaultKey]
      if (userConfigValue) {
        if (typeof userConfigValue !== type) {
          throw new Error(
            format(
              endent`
                Invalid configuration key value in ${chalk.blue(
                  configFilePath,
                )}:
                  ${chalk.blue(defaultKey)} must be of type ${chalk.blue(type)}.
                  Value ${chalk.blue(userConfigValue)} is of type ${chalk.blue(
                typeof userConfigValue,
              )}.
              `,
            ),
          )
        }
      } else {
        outConfig[defaultKey] = defaultValue
      }
      return outConfig
    },
    userConfig,
  )
}

module.exports = {
  get current() {
    return getConfig()
  },
}
