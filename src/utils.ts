import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {
  Commit,
  getOppositeOrder,
  GitHubClient,
  Repo,
  RepoCommitMap,
  SortingOrder
} from './types'

export function getClient(token: string): GitHubClient {
  core.debug('Getting client')
  return getOctokit(token)
}

export async function getUserPublicRepos(
  client: GitHubClient
): Promise<Repo[]> {
  core.debug('Getting user')

  const username = context.repo.owner

  core.info(`Getting repos for user ${username}`)

  const repos = (await client.rest.repos.listForUser({username})).data

  core.debug(`Got ${repos.length} repos`)

  return repos
}

export async function getCommitsForRepo(
  client: GitHubClient,
  repo: Repo
): Promise<Commit[]> {
  core.info(`Getting commits for repo ${repo.name}`)

  const commits = (
    await client.rest.repos.listCommits({
      owner: repo.owner.login,
      repo: repo.name
    })
  ).data

  core.debug(`Got ${commits.length} commits`)

  return commits
}

export function sortCommitsByCommitDate(
  commits: Commit[],
  order: SortingOrder
): Commit[] {
  const pass: number = order
  const fail = getOppositeOrder(order)

  return (commits = commits.sort((c1, c2) => {
    if (!c1.commit.committer?.date) {
      core.debug(
        `Commit ${c1.sha} for repo ${c1} does not have a committed date. Cannot sort`
      )

      return fail
    }

    if (c1.commit.committer?.date && c2.commit.committer?.date) {
      const date1 = new Date(c1.commit.committer?.date)
      const date2 = new Date(c2.commit.committer?.date)

      if (date1 === date2) return 0
      // Sort in descending order. If ascending, we swap the signs.
      else if (date1 > date2) return pass
    }

    return fail
  }))
}

export function sortRepoMapByCommitDate(
  map: RepoCommitMap,
  order: SortingOrder
): RepoCommitMap {
  const pass: number = order
  const fail: number = getOppositeOrder(order)

  return new Map(
    [...map]
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
        else if (date1 > date2) return pass

        return fail
      })
      .map(entry => {
        core.info(
          `Sorted commits for repo ${entry[1][0].full_name}. Latest commit date: ${entry[1][1][0].commit.committer?.date}`
        )

        return entry
      })
  )
}

export type RepoStats = {
  repo: string
  commitMsg: string
  date: string | Date
}

export function repoMapToRepoStatsMap(
  map: RepoCommitMap,
  nEntries = 5
): RepoStats[] {
  return [...map].slice(0, nEntries).map(entry => {
    const latestCommit = entry[1][1][0]

    const newLine = latestCommit.commit.message.indexOf('\n')
    const msg =
      newLine > 0
        ? latestCommit.commit.message.slice(0, newLine)
        : latestCommit.commit.message
    const date = latestCommit.commit.committer?.date ?? ''

    return {
      repo: entry[0],
      commitMsg: msg,
      date
    }
  })
}
