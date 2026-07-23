<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="https://mathjslab.com/img/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/17019e19-5270-42e0-b119-8c8b230f953f/deploy-status)](https://app.netlify.com/projects/mathjslab-calc/deploys)

MathJSLab Calc is a scientific calculator-style Web application built on top of
the `mathjslab` package. It starts as a prompt interpreter, like
`mathjslab-app`, with a collapsible calculator keypad inspired by scientific
calculator layouts.

## Development

Install dependencies:

```sh
npm install
```

Run the development server:

```sh
npm run build:dev
```

Create a production build:

```sh
npm run build
```

The build uses Eleventy for generated build configuration and Webpack for the
browser bundle. SASS/SCSS is used for global styles and component Shadow DOM
styles.
MathJSLab Calculator
