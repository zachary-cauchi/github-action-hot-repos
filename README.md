# github-action-hot-repos

<p align="center">
  [![Check dist](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/check-dist.yml/badge.svg)](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/check-dist.yml)
  [![CodeQL](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/codeql-analysis.yml)
  [![build-test](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/test.yml/badge.svg)](https://github.com/zachary-cauchi/github-action-hot-repos/actions/workflows/test.yml)
</p>

Get your most recently committed repos! This action will perform the following:
* Get all your public repos.
* Sort them by the last commit made to them.
* Output the top 5 repos along with the last commit date and last commit message.

## Inputs:

### token

Set this to a Personal Access Token or `${{ secrets.GITHUB_TOKEN }}` scoped to your user.
The token provided needs to have support for 

## entryCount

How many repo entries to return. At least one must be returned.
Default: 5

### sortOrder:

Decides in what order the repos should be returned as, whether in ascending or descending order.
Accepted values:
* Ascending: 'ascending' or 'asc'
* Descending: 'descending' or 'desc'

Default: ascending

## Output:

### toprepos:

A JSON array of all the repos returned in the following format:
```json
{
  "repo": "string", // Name of the scene.
  "commitMsg": "string", // The commit message (or first line of the commit message).
  "date": "date", // ISO 8601 date string of the last commit.
}
```

## Examples:

### Basic setup
```yml
- uses: zachary-cauchi/github-action-hot-repos@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

### Get the top 6 repos
```yml
- uses: zachary-cauchi/github-action-hot-repos@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    entryCount: 6
```

### Get the top 6 repos in ascending order
```yml
- uses: zachary-cauchi/github-action-hot-repos@v1
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
