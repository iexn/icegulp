const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');

const app = require('icegulp/register').getApp('teacher');

app.register('html', function (stream) {
    return app.destTask(stream, app.name);
});

app.register('js', function (stream) {
    stream = stream
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(uglify());

    return app.destTask(stream, `${app.name}/assets`);
});

app.register('css', function (stream) {
    stream = stream
        .pipe(sass())
        .pipe(autoprefixer({
            remove: false,
            grid  : 'autoplace'
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(cssmin());
    
    return app.destTask(stream, `${app.name}/assets`);
});

module.exports = app;
