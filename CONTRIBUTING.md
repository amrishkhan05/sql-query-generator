# Contributing

## Setup

Node.js 18 or newer is required.

```bash
git clone https://github.com/amrishkhan05/sql-query-generator.git
cd sql-query-generator
npm install
npm test
```

## Pull requests

Keep each pull request focused on one problem. Add or update a `node:test`
case when behavior changes, run `npm test`, and update the README when the
public API changes.

Open an issue before making a breaking API change. Report vulnerabilities
privately as described in [SECURITY.md](SECURITY.md).

## Releases

Publishing is handled by `.github/workflows/publish.yml`. Maintainers create a
version commit and matching tag; GitHub Actions tests and publishes that version.

```bash
npm version patch
git push origin main --follow-tags
```

Before the first automated release, configure npm Trusted Publishing for
`sql-select-query-generator` with GitHub owner `amrishkhan05`, repository
`sql-query-generator`, workflow `publish.yml`, and the `npm publish` permission.
No npm token is stored in GitHub.