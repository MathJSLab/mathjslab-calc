# Contributing to MathJSLab Demo

The following is a set of guidelines for contributing to the MathJSLab Demo.
These are mostly guidelines, not rules. Use your best judgment and feel free to
propose changes to this document in a pull request.

I'm really glad you're reading this, because we need volunteer developers to
help this project come to fruition.

All notable changes to this project will be documented in
[CHANGES.md](https://github.com/MathJSLab/mathjslab-app/blob/main/CHANGES.md)
file.

Please consider contributing to the
[MathJSLab](https://github.com/MathJSLab/mathjslab) project, which is the core
of the [MathJSLab Demo](https://github.com/MathJSLab/mathjslab-app). See the
[Work fronts](#work-fronts) section in the
[CONTRIBUTING.md](https://github.com/MathJSLab/mathjslab-app/blob/main/CONTRIBUTING.md)
file for each project to see which project your contribution fits into.

This project has an ISBN assigned to it. Whenever significant changes are made
to the project, or new contributing authors are added, a new ISBN will be
assigned to the project. Therefore, the project must continue to be educational
software.

#### Table Of Contents

- [Contributing to MathJSLab Demo](#contributing-to-mathjslab-demo) -
  [Table Of Contents](#table-of-contents)
    - [Code of Conduct](#code-of-conduct)
    - [How to Contribute](#how-to-contribute)
    - [Community](#community)
    - [Code Conventions](#code-conventions)
    - [Work fronts](#work-fronts)
    - [References](#references)

## Code of Conduct

This project and everyone participating in it is governed by the
[MathJSLab Code of Conduct](https://github.com/MathJSLab/mathjslab-app/blob/main/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report
unacceptable behavior to
[sergiolindau@gmail.com](mailto:sergiolindau@gmail.com).

## How to Contribute

Check for similar previous
[issues](https://github.com/MathJSLab/mathjslab-app/issues) before send your
own.

Please send a
[GitHub Pull Request to MathJSLab Demo](https://github.com/MathJSLab/mathjslab-app/pull/new/main)
with a clear list of what you've done (read more about
[pull requests](http://help.github.com/pull-requests/)). Please follow our
coding conventions (below) and make sure all of your commits are atomic (one
feature per commit).

Always write a clear log message for your commits. One-line messages are fine
for small changes, but bigger changes should look like this:

    $ git commit -m "A brief summary of the commit
    >
    > A paragraph describing what changed and its impact."

## Community

Join the community chat:

[![Join the chat at https://matrix.to/#/#mathjslab:gitter.im](https://badges.gitter.im/Join%20Chat.svg)](https://matrix.to/#/#mathjslab:gitter.im?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Code Conventions

All code is linted with [Prettier](https://prettier.io/).

Start reading our code and you'll get the hang of it. In summary, we adopted:

- We indent using four spaces for code files and two spaces for json files, set
  by EditorConfig.
- We ALWAYS put spaces after list items and method parameters (`[1, 2, 3]`, not
  `[1,2,3]`), around operators (`x += 1`, not `x+=1`), and around hash arrows.
- Prefer the object spread operator (`{...anotherObj}`) to `Object.assign()`.
- Inline exports with expressions whenever possible:

```typescript
// Use this:
export default class ClassName {}

// Instead of:
class ClassName {}
export default ClassName;
```

- This is an
  [open source software](https://en.wikipedia.org/wiki/Open-source_software).
  Consider the people who will read your code, and make it look nice for them.

## Work fronts

The MathJSLab Demo project started almost a decade ago, but it is still in its
infancy. There are several work fronts, some already open, others yet to begin,
none yet completed.

Some are listed below:

- Implements the choice for only prompt or only batch in Shell object.
- Create a better responsive interface to mobile devices.

You are welcome to contribute to this project. I will be very grateful if you
participate in some way.

Thanks, Sergio Lindau

## References

Here are some references consulted to carry out this project.

- [JS for Science](https://indico.cern.ch/event/853710/contributions/3708132/attachments/1985053/3307323/Armina_Abramyan_JS_for_Science.pdf)
- [D3: The JavaScript library for bespoke data visualization](https://d3js.org/)
- [HIGHCHARTS](https://www.highcharts.com/)
- [Mermaid: Diagramming and charting tool](https://mermaid.js.org/)
- [highlight.js](https://highlightjs.org/)
- [tangle](http://worrydream.com/Tangle/)
- [Android Developers](https://developer.android.com/)
- [`capacitor`](https://capacitorjs.com/)
