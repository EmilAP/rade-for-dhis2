# Public Release Cleanup Plan

## Keep

| File or folder | Rationale | Risk |
| --- | --- | --- |
| `d2.config.js` | DHIS2 App Platform config required for build/install. | Low |
| `package.json`, `package-lock.json`, and `yarn.lock` | Dependency and script definitions for reproducible review builds with npm or Yarn. | Low |
| `src/` | App source, tests, services, fixtures, and bundled schema assets. | Low |
| `i18n/` | App Platform translation scaffold. | Low |
| `README.md` | Public documentation link for reviewers and form. | Low |
| `docs/` | Self-contained reviewer, install, development, security, mapping, video, and form docs. | Low |
| `build/bundle/rade-for-dhis2-1.0.0.zip` | Installable competition artifact, small enough to keep intentionally. | Low |

## Delete

| File or folder | Rationale | Risk |
| --- | --- | --- |
| `node_modules/` | Generated dependency folder; reviewers should run `npm install`. | Low |
| `.d2/` | Generated App Platform dev shell; recreated by start/build tooling. | Low |
| `.cache/`, logs, temp/runtime folders, `.env*` | Local/generated or sensitive-by-convention files; excluded by `.gitignore`. | Low |

## Move to `docs/archive`

No files were moved to `docs/archive` during this cleanup because the app repo did not contain legacy static-only submission docs, old screenshots, duplicate READMEs, or stale architecture drafts. If such files are added later and have historical value, archive rather than delete them.

## Notes

The expanded `build/app/` folder is generated App Platform output and remains ignored. The installable archive under `build/bundle/` is intentionally keepable for this competition release.
