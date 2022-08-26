import * as core from '@actions/core'
import {
  Commit,
  getSortingOrderFromString,
  RepoCommitMap,
  SortingOrder
} from './types'
import {
  getClient,
  getCommitsForRepo,
  getUserPublicRepos,
  sortCommitsByCommitDate,
  sortRepoMapByFirstCommitDate,
  repoMapToRepoStatsMap
} from './utils'

/**
 * Main entrypoint.
 */
async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const order = getSortingOrderFromString(core.getInput('sortOrder'))
    const initialOrder = SortingOrder.Descending
    const nEntries = Math.min(
      Number.MAX_SAFE_INTEGER,
      Math.max(1, Number.parseInt(core.getInput('entryCount')))
    )

    const client = getClient(token)

    const repos = await getUserPublicRepos(client)
    const mappedCommits: RepoCommitMap = new Map()

    for (const repo of repos) {
      let commits: Commit[] = await getCommitsForRepo(client, repo)

      commits = sortCommitsByCommitDate(commits, initialOrder)

      core.info(
        `Sorted commits for repo ${repo.full_name}. Latest commit date: ${commits[0].commit.committer?.date}`
      )

      mappedCommits.set(repo.name, [repo, commits])
    }

    const sortedMap = sortRepoMapByFirstCommitDate(mappedCommits, initialOrder)

    core.info(`Sorted all repos`)

    core.info(`Getting first ${nEntries} repos.`)

    const topRepos = repoMapToRepoStatsMap(sortedMap, nEntries, order)

    core.info('Processing complete. Sending output.')

    core.setOutput('topRepos', JSON.stringify(topRepos, null, 2))

    core.info('Complete. Exiting...')
  } catch (error) {
    if (error instanceof Error) {
      core.error('Something went wrong during the action process.')
      core.setFailed(error)
    }
  }
}

run()
