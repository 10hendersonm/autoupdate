#!/usr/bin/env node

const { spawn } = require('child_process')
const config = require('./config')
const { format } = require('./log')
const chalk = require('chalk')
const endent = require('endent').default
const {
  getRemoteCommits,
  fetchRemoteBranch,
  pullRemoteBranch,
} = require('./git')

const [node, _command, ...args] = process.argv

const setImmediateAndInterval = (fx, interval) => {
  setImmediate(fx)
  return setInterval(fx, interval)
}

let interval
let initialPollInterval = true
let proc

const exitMainProcess = (code) => {
  return process.exit(code)
}

const log = (...msg) => console.log(format(...msg))

const startUpdateLoop = (initPollInterval = config.current.POLL_INTERVAL) => {
  const friendlyPollInterval = Math.round(initPollInterval / 100) / 10
  log(
    endent`
      ${initialPollInterval ? 'Initialized with' : 'Updated to'} ${chalk.blue(
      'POLL_INTERVAL'
    )} of ${chalk.blue(friendlyPollInterval)} seconds.`
  )
  initialPollInterval = false

  clearInterval(interval)
  interval = setImmediateAndInterval(async () => {
    try {
      const { POLL_INTERVAL: currentPollInterval } = config.current
      if (initPollInterval !== currentPollInterval) {
        return startUpdateLoop(currentPollInterval)
      }

      const updated = isUpToDate()

      if (!updated) {
        log('Application Out of Date from Remote')
        if (proc) {
          log('🛑 Halting App')
          await new Promise((resolve) => {
            proc.removeListener('exit', exitMainProcess)
            proc.once('exit', () => {
              log('✅ App Halted Successfully')
              proc = undefined
              resolve()
            })
            proc.kill()
          })
        }

        pullRemoteBranch()
      }

      if (!proc) {
        proc = startProcess()
        proc.addListener('exit', exitMainProcess)
      }
    } catch (err) {
      console.error(err)
      // return process.exit(1)
    }
  }, initPollInterval)
}

const isUpToDate = () => {
  fetchRemoteBranch()
  const remoteCommits = getRemoteCommits()
  return !remoteCommits
}

const startProcess = () => {
  log(
    endent`
      Spawning process:
        ${chalk.blue([node, ...args].join(' '))}
    `
  )
  return spawn(node, args, {
    stdio: 'inherit',
  }).once('spawn', () => {
    log('✅ App Started Successfully')
  })
}

startUpdateLoop()
