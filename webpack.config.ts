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

export default (_env: unknown, argv: { mode?: 'production' | 'development' }): webpack.Configuration[] => {
    const mode = argv.mode || 'production';
    const isProduction = mode === 'production';
    const buildConfiguration = buildConfig[mode];
    const exclude = ['node_modules', 'dist', 'report'].map((dir) => path.join(__dirname, dir));

    console.log(`Building ${mode} bundle.`);
    console.table(components.include);

    const configuration: webpack.Configuration = {
        name: 'mathjslab-calc',
        mode,
        entry: {
            'mathjslab-calc': path.join(__dirname, 'src', 'main.ts'),
        },
        module: {
            rules: [
                {
                    test: /\.ts$/i,
                    exclude,
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
                    test: /\.styles\.(c|sa|sc)ss$/i,
                    exclude,
                    use: ['sass-to-string', 'sass-loader'],
                },
                {
                    test: /\.(c|sa|sc)ss$/i,
                    exclude: [...exclude, /\.styles\.(c|sa|sc)ss$/i],
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
            clean: true,
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'MathJSLab Calc',
                templateContent: () => fs.readFileSync(path.join(__dirname, 'src', 'main.html'), 'utf-8').replace('</body>', `${templates}</body>`),
                inject: 'body',
            }),
            ...(isProduction ? [new MiniCssExtractPlugin({ filename: '[name].css' })] : []),
        ],
    };

    if (isProduction && 'analyzer' in buildConfiguration) {
        configuration.plugins!.push(
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: buildConfiguration.analyzer.openAnalyzer,
                reportFilename: '../report/mathjslab-calc.html',
                statsFilename: '../report/mathjslab-calc.stats.json',
                generateStatsFile: true,
            }),
        );
    }

    if (!isProduction && 'devServer' in buildConfiguration) {
        configuration.devtool = 'inline-source-map';
        const devServerConfig = (buildConfiguration as any).devServer;
        configuration.devServer = {
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
                        type: typeof devServerConfig.server.type !== 'undefined' ? devServerConfig.server.type : 'https',
                    },
        };
    }

    return buildConfiguration.bundles.includes(configuration.name!) ? [configuration] : [];
};
