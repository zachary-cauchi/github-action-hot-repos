import * as core from '@actions/core'
import {RepoStats} from './types'

/**
 * A builder class for converting an array of {@link RepoStats} into a markdown string.
 *
 */
export default class MdBuilder {
  private header: string
  private elementTemplate: string

  /**
   * A mapping between the keys in {@link RepoStats} and the strings to look out for.
   * These strings will be in the format `{{KEY}}` in all uppercase.
   * Example: The key `commitUrl` would replace any occurrence of the string `{{COMMITURL}}`.
   */
  private static readonly REPLACER_MAP: Map<keyof RepoStats, string> = [
    'repo',
    'repoUrl',
    'commitUrl',
    'commitMsg',
    'date'
  ].reduce((map, k) => map.set(k, `{{${k.toUpperCase()}}}`), new Map())

  constructor(elementTemplate: string, header = '') {
    this.header = `${header}\n`
    this.elementTemplate = `${elementTemplate}\n`

    core.info('Markdown builder initialised')
    core.debug('Markdown builder supported keys:')
    for (const [key, replacer] of MdBuilder.REPLACER_MAP) {
      core.debug(`${key}: ${replacer}`)
    }
  }

  /**
   * Constructs a string using the value of {@link elementTemplate} as a base.
   * Each replacable string in {@link REPLACER_MAP} is searched for in the base string.
   * If any replacable string is found in the map,
   * replace it with the corresponding value in the {@link input}.
   * @param input The repo stats to use when populating the template.
   * @returns A string based on {@link elementTemplate} with the properties {@link input} inserted.
   */
  repoStatsToString(input: RepoStats): string {
    let output = this.elementTemplate.repeat(1)

    for (const [key, replacer] of MdBuilder.REPLACER_MAP) {
      output = output.replace(replacer, input[key].toString())
    }

    return output
  }

  /**
   * Generates a string using the given {@link input} array.
   * The string is constructed using the {@link header} first
   * and followed by a substring for each element in {@link input}.
   * @param input The input array of {@link RepoStats}.
   * @returns The final generated string.
   */
  build(input: RepoStats[]): string {
    return input
      .map(i => this.repoStatsToString(i))
      .reduce((md, s) => md.concat(s), this.header)
      .trim()
  }
}
