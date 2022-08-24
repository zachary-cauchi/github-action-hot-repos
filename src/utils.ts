/*eslint import/no-unresolved: [2, { ignore: ['^@octokit'] }]*/
import * as core from '@actions/core'
import {getOctokit} from '@actions/github'
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types'
import {GitHub} from '@actions/github/lib/utils'

export type GitHubClient = InstanceType<typeof GitHub>
export type Repo =
  RestEndpointMethodTypes['repos']['listForUser']['response']['data'][0]

export function getClient(token: string): GitHubClient {
  core.debug('Getting client')
  return getOctokit(token)
}

export async function getUserPublicRepos(
  client: GitHubClient
): Promise<Repo[]> {
  core.debug('Getting user')
  const user = (await client.rest.users.getAuthenticated()).data
  core.debug(`Got user ${user.login}`)

  const repos = (await client.rest.repos.listForUser({username: user.login}))
    .data

  core.debug(`Got ${repos.length} repos`)

  return repos
}
