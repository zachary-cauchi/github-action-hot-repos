# github-action-hot-repos

  [![Check dist](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/check-dist.yml/badge.svg)](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/check-dist.yml)
  [![CodeQL](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/codeql-analysis.yml)
  [![build-test](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/test.yml/badge.svg)](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/test.yml)

Get your most recently committed repos! This action will perform the following:
* Get all your public repos.
* Sort them by the last commit made to them.
* Output the top repos along with the last commit date and last commit message.

## Inputs:

### token

Set this to a Personal Access Token or `${{ secrets.GITHUB_TOKEN }}` scoped to your user.
The token provided needs to have permission `contents: 'read'` at minimum.

## entryCount

How many repo entries to return. At least one must be returned.
Default: `5`

### sortOrder

Decides in what order the repos should be returned as, whether in ascending or descending order.
Accepted values:
* Ascending: 'ascending' or 'asc'
* Descending: 'descending' or 'desc'

Default: `ascending`

### jsonFilepath

The path to the file for writing the `topRepos` output. If ignored or left empty, no file will be written.

### mdHeader

A header with which to prepend to a generated markdown list of your repos. By default, this is empty. If markdown is disabled, this will be ignored.

### mdListTemplate

Determines how a repo entry will be formatted in markdown. The template can have a number of substrings which the program expects to find and will replace with its associated value. The following substrings are supported:
* `{{REPO}}`: The name of the repo.
* `{{REPOURL}}`: The url to the repo.
* `{{COMMITMSG}}`: The message or first line of the latest commit.
* `{{COMMITURL}}`: The url to the latest commit.
* `{{DATE}}`: The date of the latest commit.
If markdown is disabled, this field will be ignored.

Default: `* [{{REPO}}]({{REPOURL}}) ([{{COMMITMSG}}]({{COMMITURL}}))`

### mdFilepath

The path to the file for writing the generated markdown. If ignored or left empty, no file will be written. If markdown is disabled, this field will be ignored.

### generateMarkdown

Whether to generate markdown or not. Enabled by default.

Default: `true`

## Output:

### toprepos:

A JSON array of all the repos returned in the following format:
```json
{
  "repo": "string", // Name of the repo.
  "repoUrl": "url", // The url to the repo.
  "commitUrl": "url", // The url leading to the latest commit.
  "commitMsg": "string", // The commit message (or first line of the commit message).
  "date": "date", // ISO 8601 date string of the last commit.
}
```

### markdown

The markdown generated for the found list of repos and commits. This is only set if markdown is enabled.

## Examples:

### Basic setup
```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

### Get the top 6 repos
```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    entryCount: 6
```

### Get the top 6 repos in ascending order
```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    entryCount: 6
    order: asc
```

### Printing the top 6 repos to the console

```yml
- uses: ./
  id: test
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    entryCount: 6

- name: Check output of actions
  run: |
    echo Printing top repos;
    cat <<-;
    ${{ steps.test.outputs.topRepos }}
    
    echo printing complete;
  id: post
```

### Save the repos to a json file

```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    jsonFilepath: hot-repos.json
```

### Printing the generated markdown to the console

```yml
- uses: ./
  id: test
  with:
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Check output of actions
  run: |
    echo Printing top repos;
    cat <<-;
    ${{ steps.test.outputs.markdown }}
    
    echo printing complete;
  id: post
```

### Save the repos to a markdown file with a header

```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mdHeader: '## Latest repo commits'
    mdFilepath: hot-repos.md

```

### Save the repos to a markdown file with a header and different list template

```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    mdHeader: '## Latest repo commits'
    mdFilepath: hot-repos.md
    mdListTemplate: '* [{{REPO}}]({{REPOURL}}) Last modified: {{DATE}}'
```

### Save the repos to a json file and disable markdown

```yml
- uses: zachary-cauchi/github-action-hot-repos@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    jsonFilepath: hot-repos.json
    generateMarkdown: false
```
