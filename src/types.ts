/*eslint import/no-unresolved: [2, { ignore: ['^@octokit'] }]*/
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types'
import {GitHub} from '@actions/github/lib/utils'

// Represents the direction in which to sort repos.
export enum SortingOrder {
  Ascending = 1,
  Descending = -1
}

/**
 *
 * @param name The name of the sorting order.
 * @returns A {@link SortingOrder} which matches the name given.
 * @throws A {@link TypeError} if no match is found.
 */
export function getSortingOrderFromString(name: string): SortingOrder {
  const lower = name.toLowerCase()

  if (lower === 'asc' || lower === 'ascending') {
    return SortingOrder.Ascending
  } else if (lower === 'desc' || lower === 'descending') {
    return SortingOrder.Descending
  } else {
    throw new TypeError(`No sorting order for name ${name}`)
  }
}

/**
 * If the order is {@link SortingOrder.Ascending}, return {@link SortingOrder.Descending}, and vice versa.
 *
 * @param order The order with which to find the opposite.
 * @returns The order logically opposite to the one given.
 */
export function getOppositeOrder(order: SortingOrder): SortingOrder {
  return order === SortingOrder.Ascending
    ? SortingOrder.Descending
    : SortingOrder.Ascending
}

/**
 * Describes a repo by it's name and latest commit message and date.
 */
export type RepoStats = {
  // The name of the repo.
  repo: string
  // The url to the repo.
  repoUrl: string
  // The url to the latest commit.
  commitUrl: string
  // The message (or first message line) of the commit.
  commitMsg: string
  // The date of the commit.
  date: string | Date
}

/**
 * The client type returned by the `@actions/github` library.
 */
export type GitHubClient = InstanceType<typeof GitHub>

/**
 * Represents a repository fetched from `api.github.com`.
 */
export type Repo =
  RestEndpointMethodTypes['repos']['listForUser']['response']['data'][0]

/**
 * Represents a commit returned for a repository.
 */
export type Commit =
  RestEndpointMethodTypes['repos']['listCommits']['response']['data'][0]

/**
 * A mapping of commits belonging to a repo.
 * The key is the repository name, with the value being a pair of the repository itself, and its commits.
 */
export type RepoCommitMap = Map<string, [Repo, Commit[]]>
