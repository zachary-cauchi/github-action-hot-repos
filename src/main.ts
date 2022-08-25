import * as core from '@actions/core'
import {Commit, getSortingOrderFromString, RepoCommitMap} from './types'
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
    const order = getSortingOrderFromString(core.getInput('sortOrder'))
    const nEntries = Math.min(
      Number.MAX_SAFE_INTEGER,
      Math.max(1, Number.parseInt(core.getInput('entryCount')))
    )

    const client = getClient(token)

    const repos = await getUserPublicRepos(client)
    const mappedCommits: RepoCommitMap = new Map()

    for (const repo of repos) {
      let commits: Commit[] = await getCommitsForRepo(client, repo)

      commits = sortCommitsByCommitDate(commits, order)

      core.info(
        `Sorted commits for repo ${repo.full_name}. Latest commit date: ${commits[0].commit.committer?.date}`
      )

      mappedCommits.set(repo.name, [repo, commits])
    }

    const sortedMap = sortRepoMapByCommitDate(mappedCommits, order)

    core.info(`Sorted all repos`)

    core.info(`Getting first ${nEntries} repos.`)

    const topRepos = repoMapToRepoStatsMap(sortedMap, nEntries)

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
