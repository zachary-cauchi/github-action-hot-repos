import * as core from '@actions/core'
import {Commit, RepoCommitMap, SortingOrder} from './types'
import {
  getClient,
  getCommitsForRepo,
  getUserPublicRepos,
  sortCommitsByCommitDate,
  sortRepoMapByCommitDate,
  repoMapToRepoStatsMap
} from './utils'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})

    const client = getClient(token)

    const repos = await getUserPublicRepos(client)
    const mappedCommits: RepoCommitMap = new Map()

    try {
      for (const repo of repos) {
        let commits: Commit[] = await getCommitsForRepo(client, repo)

        commits = sortCommitsByCommitDate(commits, SortingOrder.Descending)

        core.info(
          `Sorted commits for repo ${repo.full_name}. Latest commit date: ${commits[0].commit.committer?.date}`
        )

        mappedCommits.set(repo.name, [repo, commits])
      }

      const sortedMap = sortRepoMapByCommitDate(
        mappedCommits,
        SortingOrder.Descending
      )

      core.info(`Sorted all repos`)

      const topRepos = repoMapToRepoStatsMap(sortedMap)

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

run()
