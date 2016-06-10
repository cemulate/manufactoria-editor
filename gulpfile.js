/*global require: true */

 var gulp = require('gulp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var sourceMaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var runSeq = require('run-sequence');
var del = require('del');
var connect = require('gulp-connect');
var wiredep = require('wiredep').stream;
var ghPages = require('gulp-gh-pages');

var $ = require('gulp-load-plugins')({camelize: true});

var dir = {
    index: ['./index.html', 'main.js'],
    sourceDir: './',
    source: ['./*.js', '!./gulpfile.js', '!main.js'],
    lib: ['node_modules/systemjs/dist/system.*',
          'node_modules/gulp-babel/node_modules/babel-core/browser-polyfill.*',
          'bower_components/**/*'
         ],
    libOut: './dist/libs',
    img: './img/**/*.svg',
    imgOut: './dist/img/',
    css: './css/*',
    cssOut: './dist/css',
    scss: 'scss/**/*.scss',
    scssIgnore: '!scss/build.scss',
    build: './dist',
    ignore: '!**/#*'
};

var staticCopyTasks = [];
var copyTask = require('./copyTask')(staticCopyTasks, dir, dir.build);

copyTask('index');
copyTask('img');
copyTask('lib');

gulp.task('clean-build', function(done) {
    del([dir.build + '/*.js', dir.build + '/*.map']).then(function() {done();});
});

gulp.task('copy-static', function(callback) {
    runSeq(staticCopyTasks, callback);
});

gulp.task('compileApp', function() {

    var babelOptions = {
        modules: 'system',
        moduleIds: true
    };

    return gulp.src(dir.source, {
        base: dir.sourceDir
    })
        .pipe(plumber())
        .pipe(sourceMaps.init())
        .pipe(babel(babelOptions))
        .pipe(concat('all.js'))
        .pipe(sourceMaps.write('.', {sourceMappingURLPrefix: ''}))
        .pipe(gulp.dest(dir.build));
});

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

gulp.task('watchJS', function() {
    // return gulp.watch([dir.source, dir.lib, dir.index], ['build-dev']);
    return gulp.watch([dir.ignore, dir.source], ['compileApp']);
});

gulp.task('watchStatic', function() {
    // return gulp.watch([dir.source, dir.lib, dir.index], ['build-dev']);
    return gulp.watch([dir.ignore, dir.index, dir.img], ['bower']);
});

gulp.task('watch-scss', function() {
    // return gulp.watch([dir.source, dir.lib, dir.index], ['build-dev']);
    return gulp.watch([dir.ignore, dir.scssIgnore, dir.scss], ['scss']);
});

gulp.task('connect', function() {
    return connect.server({
        root: dir.build,
        livereload: false,
        host: 'localhost',
        port: 8081
    });
});

gulp.task('build-dev', function(cb) {
    runSeq('clean-build', ['compileApp', 'bower', 'scss'], cb);
});

/* Build and copy files to outside directory */
gulp.task('export', ['build-dev'], function() {
    gulp.src(dir.build + '/**/*')
        .pipe(gulp.dest('../manufractoria-build'));
});

gulp.task('default', function(cb) {
    runSeq('build-dev', ['watchJS', 'watchStatic', 'watch-scss', 'connect'], cb);
});

gulp.task('bower', ['copy-static'], function() {
    return gulp.src(dir.build + '/index.html')
        .pipe(wiredep({
            cwd: '.',
            ignorePath: /\.\.\/bower_components\//,
            fileTypes: {
        html: {
            replace: {
                js: '<script type="text/javascript" src="libs/{{filePath}}"></script>',
                css:'<link rel="stylesheet" href="libs/{{filePath}}" />'
            }
        }
    }
        }))
        .pipe(gulp.dest(dir.build));
});

gulp.task('bower-scss', function() {
    return gulp.src('scss/main.scss')
        .pipe(wiredep({
            overrides: {
                foundation: {
                    main: ['./scss/foundation.scss', './scss/normalize.scss']
                }
            }
        }))
        .pipe($.rename('build.scss'))

        .pipe(gulp.dest('scss'));
});

gulp.task('scss', ['bower-scss'], function() {
    return gulp.src('scss/build.scss')
        .pipe(plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: ['bower_components/foundation/scss']
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(dir.cssOut));
});

gulp.task('icons', ['bower'], function() {
    var favicons = require('gulp-favicons');

    return gulp.src(dir.build + '/index.html')
        .pipe(favicons({
            files: {
                src: 'img/icon.png',
                dest: 'img'
            },
            settings: {
                background: '#333333'
            }
        }))
        .pipe(gulp.dest(dir.build));
});
