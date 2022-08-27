import * as core from '@actions/core'
import MdBuilder from './md-formatter'
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
 * All the expected inputs of the action.
 */
type ActionInputs = {
  token: string
  order: SortingOrder
  initialOrder: SortingOrder
  nEntries: number
  mdHeader: string
  mdListTemplate: string
  generateMarkdown: boolean
}

/**
 * Gets all the supported inputs of the program.
 * If any one is undefined or null, it's still returned as null.
 * @returns The found inputs.
 */
function getInputs(): ActionInputs {
  const token = core.getInput('token', {required: true})
  const order = getSortingOrderFromString(core.getInput('sortOrder'))
  const initialOrder = SortingOrder.Descending
  const nEntries = Math.min(
    Number.MAX_SAFE_INTEGER,
    Math.max(1, Number.parseInt(core.getInput('entryCount')))
  )

  const mdHeader = core.getInput('mdHeader', {trimWhitespace: false})
  const mdListTemplate = core.getInput('mdListTemplate', {
    trimWhitespace: false
  })
  const generateMarkdown = core.getBooleanInput('generateMarkdown')

  return {
    token,
    order,
    initialOrder,
    nEntries,
    mdHeader,
    mdListTemplate,
    generateMarkdown
  }
}

/**
 * Main entrypoint.
 */
async function run(): Promise<void> {
  try {
    const {
      token,
      order,
      initialOrder,
      nEntries,
      mdHeader,
      mdListTemplate,
      generateMarkdown
    } = getInputs()
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

    if (generateMarkdown) {
      core.info('Generating markdown...')

      const builder = new MdBuilder(mdListTemplate, mdHeader)

      core.debug(`Generating markdown with template ${mdListTemplate.trim()}`)
      core.debug(`With header ${mdHeader}`)

      const md = builder.build(topRepos)

      core.setOutput('markdown', md)
    }

    core.info('Complete. Exiting...')
  } catch (error) {
    if (error instanceof Error) {
      core.error('Something went wrong during the action process.')
      core.setFailed(error)
    }
  }
}

run()
