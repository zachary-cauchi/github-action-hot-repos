/*eslint import/no-unresolved: [2, { ignore: ['^@octokit'] }]*/
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types'
import {GitHub} from '@actions/github/lib/utils'

export enum SortingOrder {
  Ascending = 1,
  Descending = -1
}

export type GitHubClient = InstanceType<typeof GitHub>

export type Repo =
  RestEndpointMethodTypes['repos']['listForUser']['response']['data'][0]

export type Commit =
  RestEndpointMethodTypes['repos']['listCommits']['response']['data'][0]

export type RepoCommitMap = Map<string, [Repo, Commit[]]>
