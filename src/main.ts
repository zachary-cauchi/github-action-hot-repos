import * as core from '@actions/core'
import {getClient, getUserPublicRepos} from './utils'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})

    const client = getClient(token)
    const repos = await getUserPublicRepos(client)

    try {
      const commits = (
        await client.rest.repos.listCommits({
          owner: repos[0].owner.login,
          repo: repos[0].name
        })
      ).data

      core.info(`Got ${commits.length} commits.`)
    } catch (e) {
      if (e instanceof Error) core.setFailed(e)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error)
  }
}

// async function run(): Promise<void> {
//   try {
//     const ms: string = core.getInput('milliseconds')
//     core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

//     core.debug(new Date().toTimeString())
//     await wait(parseInt(ms, 10))
//     core.debug(new Date().toTimeString())

//     core.setOutput('time', new Date().toTimeString())
//   } catch (error) {
//     if (error instanceof Error) core.setFailed(error.message)
//   }
// }

run()
