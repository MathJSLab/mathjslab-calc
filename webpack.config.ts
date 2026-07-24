/**
 * webpack.config.ts: Webpack configuration factory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import buildConfig from './build.config.json' with { type: 'json' };

import { components, templates } from './src/components/component.include';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StaticRootAssetsPlugin {
    apply(compiler: webpack.Compiler): void {
        compiler.hooks.afterEmit.tap('StaticRootAssetsPlugin', () => {
            const outputPath = compiler.options.output.path;
            if (!outputPath) {
                return;
            }
            ['manifest.json', 'robots.txt', 'sitemap.xml'].forEach((file) => {
                const source = path.join(__dirname, file);
                if (fs.existsSync(source)) {
                    fs.copyFileSync(source, path.join(outputPath, file));
                }
            });
            fs.cpSync(path.join(__dirname, 'images'), path.join(outputPath, 'images'), { recursive: true });
        });
    }
}

export default (env: any, argv: any): webpack.Configuration[] => {
    const mode = (argv.mode || 'production') as 'production' | 'development';
    const isProduction = mode === 'production';
    const buildConfiguration = buildConfig[mode];
    const defaultExclude = ['node_modules', 'dist', 'data', 'images', 'report', 'script'];

    console.log(`\nWebpack configuration: ${path.basename(__filename)}`);
    console.log(`Web components included:`);
    console.table(components.include);
    console.log(`Building ${mode} bundle.`);
    console.log(`Build environment variables:`);
    console.table(env);

    const WebpackConfiguration: webpack.Configuration[] = [
        {
            name: 'mathjslab-calc',
            mode: argv.mode,
            entry: {
                'mathjslab-calc': path.join(__dirname, 'src', 'main.ts'),
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/i,
                        exclude: defaultExclude.map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                        use: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    configFile: 'tsconfig.build.json',
                                },
                            },
                        ],
                    },
                    {
                        test: /\.module\.(c|sa|sc)ss$/i,
                        exclude: defaultExclude.map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                        use: [
                            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: {
                                        auto: true,
                                        localIdentName: isProduction ? '[hash:base64:6]' : '[path][name]__[local]',
                                    },
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                },
                            },
                        ],
                    },
                    {
                        test: /\.styles\.(c|sa|sc)ss$/i,
                        exclude: defaultExclude.map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                        use: ['sass-to-string', 'sass-loader'],
                    },
                    {
                        test: /\.(c|sa|sc)ss$/i,
                        exclude: [...defaultExclude, /\.module\.(c|sa|sc)ss$/i, /\.styles\.(c|sa|sc)ss$/i].map((dir) => (typeof dir === 'string' ? path.join(__dirname, dir) : dir)),
                        use: [
                            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                            'css-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        outputStyle: 'compressed',
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
                extensionAlias: {
                    '.js': ['.js', '.ts'],
                },
            },
            output: {
                filename: 'mathjslab-calc.js',
                path: path.join(__dirname, 'dist'),
                environment: {
                    module: true,
                    dynamicImport: true,
                },
            },
            plugins: [
                new HtmlWebpackPlugin({
                    title: 'MathJSLab Calc',
                    templateContent: (_templateParameters: { [option: string]: any }): string =>
                        fs.readFileSync(path.join(__dirname, 'src', 'main.html'), 'utf-8').replace('</body>', templates + '</body>'),
                    inject: 'body',
                }),
                new StaticRootAssetsPlugin(),
                ...(isProduction ? [new MiniCssExtractPlugin({ filename: '[name].css' })] : []),
            ],
        },
    ];
    const bundlesConfiguration = WebpackConfiguration.filter((config) => buildConfiguration.bundles.includes(config.name!));
    if (isProduction) {
        const analyzerConfig = (buildConfiguration as any).analyzer;
        if (typeof analyzerConfig !== 'undefined') {
            bundlesConfiguration.forEach((config) => {
                let options: BundleAnalyzerPlugin.Options = {
                    analyzerMode: 'static',
                    openAnalyzer: true,
                    generateStatsFile: true,
                    defaultSizes: 'stat',
                    statsFilename: `../report/${config.name}.stats.json`,
                    reportFilename: `../report/${config.name}.html`,
                };
                if (typeof analyzerConfig === 'object') {
                    options = Object.assign(options, analyzerConfig);
                }
                config.plugins!.push(new BundleAnalyzerPlugin(options));
            });
        }
    } else {
        const devServerConfig = (buildConfiguration as any).devServer;
        if (typeof devServerConfig !== 'undefined') {
            bundlesConfiguration.forEach((config) => {
                Object.assign(config, {
                    devtool: 'inline-source-map',
                    devServer: {
                        devMiddleware: { publicPath: '/', writeToDisk: true },
                        static: { directory: path.join(__dirname, 'dist'), serveIndex: false, publicPath: '/' },
                        historyApiFallback: { index: '/index.html', disableDotRule: true },
                        compress: typeof devServerConfig.compress !== 'undefined' ? devServerConfig.compress : true,
                        port: typeof devServerConfig.port !== 'undefined' ? devServerConfig.port : 8080,
                        hot: typeof devServerConfig.hot !== 'undefined' ? devServerConfig.hot : true,
                        liveReload: typeof devServerConfig.liveReload !== 'undefined' ? devServerConfig.liveReload : true,
                        open: typeof devServerConfig.open !== 'undefined' ? devServerConfig.open : false,
                        server:
                            typeof devServerConfig.server !== 'undefined'
                                ? devServerConfig.server
                                : {
                                      type: 'https',
                                  },
                    },
                });
            });
        }
    }
    return bundlesConfiguration;
};
