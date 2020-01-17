const gulp = require('gulp')
const sass = require('gulp-sass')
const webpack = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')
const iconfont = require('gulp-iconfont')
const iconfontCss = require('gulp-iconfont-css')
const runTimestamp = Math.round(Date.now()/1000)
const cheerio = require('gulp-cheerio')
const replace = require('gulp-replace')
const svgmin = require('gulp-svgmin')
const svgSymbols = require('gulp-svg-symbols')
const rename = require('gulp-rename')
const {series, parallel} = require('gulp')
const {pathes, fontConfig} = require('./package.json')
const svgToFontsNoSymbols = true

sass.compiler = require('node-sass')

function htmlHandler(cb) {
    return gulp
        .src(`${pathes.srcAll}.html`)
        .pipe(gulp.dest(pathes.dest))

    cb();
}

function scssCompiler(cb) {
    return gulp
        .src(`${pathes.srcAll}.scss`)
        .pipe(
            sass().on('error', sass.logError)
        )
        .pipe(gulp.dest(pathes.dest))
    cb();
}

function jsCompiler(cb) {
    return gulp
        .src(`${pathes.srcAll}.js`)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(`${pathes.dest}`))

    cb()
}

function iconsHandler(cb) {
    fontConfig.icons.timestamp = runTimestamp

    if (svgToFontsNoSymbols) {
        return gulp
            .src(`${pathes.iconsAll}.svg`)
            .pipe(cheerio({
                run: $ => {
                    fontConfig.removeAttibutes.forEach(
                        attribute => $(`[${attribute}]`).removeAttr(`${attribute}`)
                    );
                },
                parserOptions: {xmlMode: true}
            }))
            .pipe(svgmin(fontConfig.svgMin))
            .pipe(replace('&gt;', '>'))
            .pipe(iconfontCss(fontConfig.styles))
            .pipe(iconfont(fontConfig.icons))
            .on('glyphs', (glyphs, options) => console.log(glyphs, options))
            .pipe(gulp.dest(`dev/${fontConfig.styles.fontPath}`))
    } else {
        return gulp
            .src(`${pathes.iconsAll}.svg`)
            .pipe(cheerio({
                run: $ => {
                    fontConfig.removeAttibutes.forEach(
                        attribute => $(`[${attribute}]`).removeAttr(`${attribute}`)
                    );
                },
                parserOptions: {xmlMode: true}
            }))
            .pipe(svgmin(fontConfig.svgMin))
            .pipe(replace('&gt;', '>'))
            .pipe(svgSymbols(fontConfig.svgSymbols))
            .pipe(rename({
                prefix: '_'
            }))
            .pipe(gulp.dest(pathes.utils))
    }

    cb()
}

function watch(cb) {
    gulp.watch(`${pathes.srcAll}.html`, htmlHandler)
    gulp.watch(`${pathes.srcAll}.scss`, scssCompiler)
    gulp.watch(`${pathes.iconsAll}.svg`, iconsHandler)
    gulp.watch(`${pathes.srcAll}.js`, jsCompiler)

    cb();
}

exports.default = series(
    iconsHandler,
    parallel(
        htmlHandler,
        scssCompiler,
        jsCompiler
    ),
    watch
)
