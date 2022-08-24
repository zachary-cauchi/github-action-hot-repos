import * as core from '@actions/core'
import {
  Commit,
  getClient,
  getCommitsForRepo,
  getUserPublicRepos,
  Repo
} from './utils'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})

    const client = getClient(token)
    const repos = await getUserPublicRepos(client)
    const mappedCommits: Map<string, [Repo, Commit[]]> = new Map()

    try {
      for (const repo of repos) {
        const commits: Commit[] = await getCommitsForRepo(client, repo)

        mappedCommits.set(repo.name, [repo, commits])

        core.debug(JSON.stringify(mappedCommits, null, 2))
      }
    } catch (e) {
      if (e instanceof Error) {
        core.error('Something went wrong getting the commits.')
        core.setFailed(e)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error('Something went wrong during the action process.')
      core.setFailed(error)
    }
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
