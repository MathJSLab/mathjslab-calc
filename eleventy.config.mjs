export default function (eleventyConfig) {
  eleventyConfig.addTemplateFormats('njk');
  eleventyConfig.ignores.add('components/**');
  eleventyConfig.ignores.add('main.html');

  return {
    templateFormats: ['njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: './src',
      includes: 'includes',
      output: './src',
    },
  };
}
