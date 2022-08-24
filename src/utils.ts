/*eslint import/no-unresolved: [2, { ignore: ['^@octokit'] }]*/
import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types'
import {GitHub} from '@actions/github/lib/utils'

export type GitHubClient = InstanceType<typeof GitHub>

export type Repo =
  RestEndpointMethodTypes['repos']['listForUser']['response']['data'][0]

export type Commit =
  RestEndpointMethodTypes['repos']['listCommits']['response']['data'][0]

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

  // const user = (await client.rest.users.getAuthenticated()).data
  // core.debug(`Got user ${user.login}`)

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
