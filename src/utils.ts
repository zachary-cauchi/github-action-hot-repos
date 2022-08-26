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

/**
 * Fetch a client for consuming the github api.
 * @param token A github token for fetching the client.
 * @returns A {@link GitHubClient} client configured with the given token.
 */
export function getClient(token: string): GitHubClient {
  core.debug('Getting client.')
  return getOctokit(token)
}

/**
 * Get a list of all public repositories belonging to the user.
 * @param client The client to use.
 * @returns A list of public repositories belonging to the client user.
 */
export async function getUserPublicRepos(
  client: GitHubClient
): Promise<Repo[]> {
  core.debug('Getting user.')

  const username = context.repo.owner

  core.info(`Getting repos for user ${username}.`)

  const repos = (await client.rest.repos.listForUser({username})).data

  core.debug(`Got ${repos.length} repos.`)

  return repos
}

/**
 * Get a list of commits for the given repo.
 * @param client The client to use.
 * @param repo The repo to search.
 * @returns An array of commits belonging to the given {@link repo}.
 */
export async function getCommitsForRepo(
  client: GitHubClient,
  repo: Repo
): Promise<Commit[]> {
  core.info(`Getting commits for repo ${repo.name}.`)

  const commits = (
    await client.rest.repos.listCommits({
      owner: repo.owner.login,
      repo: repo.name
    })
  ).data

  core.debug(`Got ${commits.length} commits.`)

  return commits
}

/**
 * Sorts a given array by their commit date in ascending/descending order.
 * The {@link commits} array is **mutated**, and returned in the process.
 * @param commits The commits array to sort.
 * @param order The order in which to sort them.
 * @returns The same {@link commits} array but sorted.
 */
export function sortCommitsByCommitDate(
  commits: Commit[],
  order: SortingOrder
): Commit[] {
  const pass: number = order
  const fail = getOppositeOrder(order)

  return (commits = commits.sort((c1, c2) => {
    const date1 = new Date(c1.commit.committer?.date ?? 0)
    const date2 = new Date(c2.commit.committer?.date ?? 0)

    if (date1 === date2) return 0
    else if (date1 > date2) return pass

    return fail
  }))
}

/**
 * Sort the given {@link RepoCommitMap} in order by their last commit date.
 * This assumes the commits are **already sorted**.
 * @param map A map containing the repositories - and their commits - to sort.
 * @param order The order in which to sort the map entries.
 * @returns Returns a new map with the original {@link map} entries sorted.
 */
export function sortRepoMapByFirstCommitDate(
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

        const date1 = new Date(commit1.commit.committer?.date ?? 0)
        const date2 = new Date(commit2.commit.committer?.date ?? 0)

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

/**
 * Describes a repo by it's name and latest commit message and date.
 */
export type RepoStats = {
  repo: string
  commitMsg: string
  date: string | Date
}

/**
 * Construct an array of {@link RepoStats} from the given {@link map}.
 * The first {@link nEntries} from the map are selected, and inserted into the array in the {@link sortOrder} specified.
 * @param map The input {@link RepoCommitMap} to use for constructing the returned array.
 * @param nEntries How many entries to select from the {@link map}.
 * @param sortOrder The order in which to put newly-added entries into the map.
 * @returns A new array of {@link RepoStats} based on the given {@link map}.
 */
export function repoMapToRepoStatsMap(
  map: RepoCommitMap,
  nEntries = 5,
  sortOrder = SortingOrder.Descending
): RepoStats[] {
  return [...map]
    .slice(0, nEntries)
    .map(entry => {
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
    .sort((e1, e2) => {
      const pass: number = sortOrder
      const fail: number = getOppositeOrder(sortOrder)

      const date1 = new Date(e1.date)
      const date2 = new Date(e2.date)

      if (date1 === date2) return 0
      else if (date1 > date2) return pass

      return fail
    })
}
