const { src, dest, watch, parallel, series } = require("gulp");
const sass = require('gulp-sass');

function copy(cb) {
    src('routes/*.js')
        .pipe(dest('copies'));
    cb();
}

exports.copy = copy;

function generateCSS(cb) {
    src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('public/stylesheets'))
        .pipe(sync.stream());
    cb();
}

exports.css = generateCSS;


const ejs = require("gulp-ejs");
const rename = require("gulp-rename");

function generateHTML(cb) {
    src("./views/index.ejs")
        .pipe(ejs({
            title: "Hello Semaphore!",
        }))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(dest("public"));
    cb();
}

exports.html = generateHTML;

const eslint = require("gulp-eslint");

function runLinter(cb) {
    return src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format()) 
        .pipe(eslint.failAfterError())
        .on('end', function() {
            cb();
        });
}

exports.lint = runLinter;


const mocha = require("gulp-mocha");

function runTests(cb) {
    return src(['**/*.test.js'])
        .pipe(mocha())
        .on('error', function() {
            cb(new Error('Test failed'));
        })
        .on('end', function() {
            cb();
        });
}
exports.test = runTests;


function watchFiles(cb) {
    watch('views/**.ejs', generateHTML);
    watch('sass/**.scss', generateCSS);
    watch([ '**/*.js', '!node_modules/**'], parallel(runLinter, runTests));
}

exports.watch = watchFiles;


const sync = require("browser-sync").create();

function browserSync(cb) {
    sync.init({
        server: {
            baseDir: "./public"
        }
    });

    watch('views/**.ejs', generateHTML);
    watch('sass/**.scss', generateCSS);
    watch("./public/**.html").on('change', sync.reload);
}

exports.sync = browserSync;

exports.default = series(runLinter,parallel(generateCSS,generateHTML),runTests);