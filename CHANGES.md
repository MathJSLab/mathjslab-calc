# Release notes

All notable changes to this project will be documented in this file. This
project adheres to [Semantic Versioning](http://semver.org/).

## 0.1.0

- Consolidated SEO head definitions around the shared Nunjucks
  `head-macros.njk` template copied from the organization repository.
- Added granular schema.org JSON-LD macros for application, webpage, website,
  organization, person, and application-list graph nodes.
- Replaced the separate SEO head include templates with calls to the shared
  head macros.
- Fixed the generated meta description and canonical/alternate language links
  for the multilingual application endpoints.
- Dependencies updated (`webpack` 5.110.1).

## 0.0.8

- Toggle button between the native keyboard and the app's keyboard on mobile
  devices.
- Implementation of the programming keypad panel.
- Multilingual i18n engine with more streamlined definitions in the `data/`
  directory.
- The project page was implemented using SCSS templates in the same way as in
  the `mathjslab-app` project, by copying files from the organization's
  repository.
- Dependecies updated (`mathjslab` 2.5.1).

## 0.0.7

- Dependecies updated (`mathjslab` 2.5.0).

## 0.0.6

- Dependecies updated (`mathjslab` 2.4.0).

## 0.0.5

- Added the `appEngine` and `InterpreterConfiguration` startup model inspired
  by `mathjslab-app`.
- Added language-aware interpreter aliases and improved startup locale
  detection for English, Spanish, and Portuguese.
- Added the scientific prompt calculator shell, prompt history, responsive
  keypad panels, and MathJSLab logo branding.
- Added Web App Manifest, robots and sitemap support, including production
  asset copy into `dist`.
- Added pre-publication JSDoc and code comments for the app-specific runtime
  and Web Components.

## 0.0.4

- Dependecies updated (`mathjslab` 2.3.0).

## 0.0.3

- DOI and other badges added.

## 0.0.2

- Dependecies updated (`mathjslab` 2.2.1).

## 0.0.1

- Project launch.
