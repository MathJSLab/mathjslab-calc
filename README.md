<p align="center">
    <a href="https://mathjslab.com/" target="_blank" rel="noopener"><img src="https://mathjslab.com/img/mathjslab-logo.svg" alt="logo" width="200" height="200" /></a>
</p>

# [MathJSLab](https://mathjslab.com/) - [mathjslab.com](https://mathjslab.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/17019e19-5270-42e0-b119-8c8b230f953f/deploy-status)](https://app.netlify.com/projects/mathjslab-calc/deploys)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmathjslab.com%2F)](https://mathjslab.com/)

> An [interpreter](<https://en.wikipedia.org/wiki/Interpreter_(computing)>)
> with language syntax like
> [MATLAB&reg;](https://www.mathworks.com/)/[Octave](https://www.gnu.org/software/octave/)
> written in [TypeScript](https://www.typescriptlang.org/).

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

## Trademark Notes

- [MATLAB&reg;](https://www.mathworks.com/products/matlab.html) is a registered
  trademark of [The MathWorks, Inc.](https://www.mathworks.com/)
- [MathJSLab](https://mathjslab.com/) is not affiliated, sponsored, or endorsed
  by [The MathWorks, Inc.](https://www.mathworks.com/)

## License

> [MIT License](https://opensource.org/license/mit)
>
> Copyright &copy; 2016-2024 [Sergio Lindau](mailto:sergiolindau@gmail.com),
> [mathjslab.com](https://mathjslab.com/),
> [ISBN 978-65-00-84828-1](https://grp.isbn-international.org/search/piid_solr?keys=978-65-00-84828-1)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
