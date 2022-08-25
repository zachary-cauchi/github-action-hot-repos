/*eslint import/no-unresolved: [2, { ignore: ['^@octokit'] }]*/
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types'
import {GitHub} from '@actions/github/lib/utils'

export enum SortingOrder {
  Ascending = 1,
  Descending = -1
}

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

export function getOppositeOrder(order: SortingOrder): SortingOrder {
  return order === SortingOrder.Ascending
    ? SortingOrder.Descending
    : SortingOrder.Ascending
}

export type GitHubClient = InstanceType<typeof GitHub>

export type Repo =
  RestEndpointMethodTypes['repos']['listForUser']['response']['data'][0]

export type Commit =
  RestEndpointMethodTypes['repos']['listCommits']['response']['data'][0]

export type RepoCommitMap = Map<string, [Repo, Commit[]]>
