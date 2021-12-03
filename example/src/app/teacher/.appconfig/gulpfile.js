const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const gutil = require('gulp-util');

const app = require('icegulp/register').getApp('teacher');

app.register('html', function (stream) {
    return app.destTask(stream, app.name);
});

app.register('js', function (stream) {
    stream = stream
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .on('error', function (e) {
            console.error(e.message);
        })
        .pipe(rename({ extname: '.min.js' }))
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        });

    return app.destTask(stream, `${app.name}/assets`);
});

app.register('css', function (stream) {
    stream = stream
        .pipe(sass())
        .on('error', function (e) {
            console.error(e.message);
        })
        .pipe(autoprefixer({
            remove: false,
            grid  : 'autoplace'
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(cssmin())
        .on('error', function (e) {
            console.error(e.message);
        });
    
    return app.destTask(stream, `${app.name}/assets`);
});

module.exports = app;
