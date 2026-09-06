# Release notes

All notable changes to this project will be documented in this file. This
project adheres to [Semantic Versioning](http://semver.org/).

## 0.2.0

- Replaced the first calculator-specific Web Components with reusable shared
  components from the organization repository, including `application-wrapper`,
  `command-prompt`, `command-prompt-list`, `keyboard-panel`, `control-bar`,
  `language-switcher`, and `appearance-mode`.
- Added the `control-bar` integration for the language selector, appearance
  mode selector, and calculator keyboard toggle without changing the visual
  toolbar appearance.
- Improved the prompt runtime with syntax highlighting, selectable prompt text,
  native/app keyboard switching on mobile devices, and removal of development
  console diagnostics.
- Expanded the calculator keyboard with scientific, function, alphabetic, and
  programming panels, including responsive compact layouts and programming
  base-specific key enabling.
- Improved responsive layout behavior for desktop, landscape mobile, and
  portrait mobile views so the keyboard remains aligned with the viewport base.
- Consolidated application styling around shared SCSS templates and adjusted
  calculator-specific button contrast for light and dark modes.
- Added endpoint-aware multilingual SEO support for `calc.mathjslab.com`,
  including localized canonical and alternate links, JSON-LD graph macros,
  generated `robots.txt`, and sitemap `lastmod` values based on source file
  modification times.
- Updated the MathJSLab SEO diagnosis page in `mathjslab-www` with online SEO
  tool links for the calculator application endpoints.
- Dependencies updated (`webpack` 5.110.3).

## 0.1.0

- Prompt history now uses the shared `command-prompt-list` Web Component,
  bringing the app command prompt keyboard navigation, prompt insertion,
  deletion, and evaluation behavior to the calculator.
- The `AC` keypad command now clears the full prompt history and opens a fresh
  active prompt.
- The shared `command-prompt` textarea background now remains transparent so
  the calculator prompt area preserves the application visual identity.
- The calculator prompt now uses the shared `command-prompt` Web Component from
  the organization repository while preserving the existing prompt list,
  evaluator, and mobile keyboard behavior.
- Prompt MathML output now fits the available prompt width without adding
  internal horizontal scroll controls.
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
