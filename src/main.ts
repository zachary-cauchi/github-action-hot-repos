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

    core.info(token)

    const client = getClient(token)
    const repos = await getUserPublicRepos(client)
    const mappedCommits: Map<string, [Repo, Commit[]]> = new Map()

    try {
      for (const repo of repos) {
        let commits: Commit[] = await getCommitsForRepo(client, repo)

        commits = commits.sort((c1, c2) => {
          if (!c1.commit.committer?.date) {
            core.debug(
              `Commit ${c1.sha} for repo ${repo.full_name} does not have a committed date. Cannot sort`
            )

            return -1
          }

          if (c1.commit.committer?.date && c2.commit.committer?.date) {
            const date1 = new Date(c1.commit.committer?.date)
            const date2 = new Date(c2.commit.committer?.date)

            if (date1 === date2) return 0
            // Sort in descending order. If ascending, we swap the signs.
            else if (date1 < date2) return 1
          }

          return -1
        })

        core.info(
          `Sorted commits for repo ${repo.full_name}. Latest commit date: ${commits[0].commit.committer?.date}`
        )

        mappedCommits.set(repo.name, [repo, commits])

        core.debug(JSON.stringify(mappedCommits, null, 2))
      }

      const sortedMap = new Map(
        [...mappedCommits]
          .sort((list1, list2) => {
            const commit1 = list1[1][1][0]
            const commit2 = list2[1][1][0]

            const date1 = commit1.commit.committer?.date
              ? new Date(commit1.commit.committer?.date)
              : new Date(0)
            const date2 = commit2.commit.committer?.date
              ? new Date(commit2.commit.committer?.date)
              : new Date(0)

            if (date1 === date2) return 0
            else if (date1 < date2) return 1

            return -1
          })
          .map(entry => {
            core.info(
              `Sorted commits for repo ${entry[1][0].full_name}. Latest commit date: ${entry[1][1][0].commit.committer?.date}`
            )

            return entry
          })
      )

      core.info(`Sorted all repos`)

      const topRepos = [...sortedMap].slice(0, 5).map(entry => {
        const latestCommit = entry[1][1][0]

        const newLine = latestCommit.commit.message.indexOf('\n')
        const msg = latestCommit.commit.message.slice(
          0,
          newLine > 0 ? newLine : undefined
        )
        const date = latestCommit.commit.committer?.date

        return {
          repo: entry[0],
          commitMsg: msg,
          date
        }
      })

      core.setOutput('topRepos', JSON.stringify(topRepos, null, 2))
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
