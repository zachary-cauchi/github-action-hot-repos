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
        let commits: Commit[] = await getCommitsForRepo(client, repo)

        commits = commits.sort((c1, c2) => {
          if (c1.commit.committer?.date && c2.commit.committer?.date) {
            const date1 = new Date(c1.commit.committer?.date)
            const date2 = new Date(c2.commit.committer?.date)

            if (date1 === date2) return 0
            // Sort in descending order. If ascending, we swap the signs.
            else if (date1 > date2) return 1
            else if (date1 < date2) return -1
          }

          core.debug(
            `Sorted commits for repo ${repo.full_name}. Latest commit date: ${commits[0].commit.committer?.date}`
          )

          throw new Error(
            `One or more commits for repo ${repo.full_name} does not have a committed date. Cannot sort`
          )
        })

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
