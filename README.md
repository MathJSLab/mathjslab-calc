# mathjslab-calc

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
