var gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    gulpif        = require('gulp-if'),
    uglify        = require('gulp-uglify'),
    concat        = require('gulp-concat'),
    sass          = require('gulp-ruby-sass'),
    streamqueue   = require('streamqueue'),
    sourcemaps    = require('gulp-sourcemaps'),
    runSequence   = require('run-sequence'),
    stripDebug    = require('gulp-strip-debug'),
    htmlReplace   = require('gulp-html-replace'),
    templateCache = require('gulp-angular-templatecache'),
    del           = require('del'),
    es            = require('event-stream'),
    fs            = require('fs'),
    webpack       = require('webpack-stream'),
    notify        = require("gulp-notify");

var minifiedApp = 'admin.app.min.js';
var version     = '';
var lastVersion = '';
var env = process.env.V; // V={version number} ie: V=1.0.1 gulp build

var config = {
    srcPartials:[ 'app/index.html', 'app/**/*.html', 'app/**/**/*.html'],
    destTemplateCache: 'app/templates/'
};

var paths = {
    scripts: ['app/api/*.js',
              'app/admin/*.js',
              'app/analytics/*.js',
              'app/auth/*.js',
              'app/bulk/*.js',
              'app/constants/*.js',
              'app/helpers/*.js',
              'app/index/*.js',
              'app/message/*.js',
              'app/login/*.js',
              'app/nav/*.js',
              'app/notifications/*.js',
              'app/overlay/*.js',
              'app/rest/*.js',
              'app/settings/*.js',
              'app/tags/**',
              'app/tags/*.js',
              'app/templates/*.js',
              'app/tickers/*.js',
              'app/topics/*.js',
              'app/users/*.js',
              'app/admin.js'],

    vendors: ['bower_components/angularjs/angular.min.js',
              'bower_components/angular-animate/angular-animate.min.js',
              'bower_components/angular-ui-router/release/angular-ui-router.min.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
              'bower_components/angular-sanitize/angular-sanitize.min.js',
              'bower_components/angular-scroll/angular-scroll.min.js',
              'bower_components/angular-busy/dist/angular-busy.min.js',
              'bower_components/moment/min/moment.min.js',
              'bower_components/highcharts/highstock.js',
              'bower_components/highcharts-ng/dist/highcharts-ng.min.js',
              'bower_components/es6-shim/es6-shim.min.js',
              'bower_components/lodash/dist/lodash.min.js',
              'bower_components/ramda/dist/ramda.min.js',
              'bower_components/ng-csv/build/ng-csv.min.js'],

    lastBuild: 'build/assets',
    default: 'app/assets/js/admin.app.js',
    bundle: ['app/admin.app.min.js',
             'app/admin.app.js.map']
};

function errorlog(err) {
    gutil.log(gutil.colors.red.bold.inverse('  ERROR: '+err));
    this.emit('end');
}

// Build tasks /////////////////////////////////////////////////////////////////
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build', function(cb) {
    runSequence(
        'version',                  // Save new version
        'build:move-files',         // Move files into new static folder
        'html-templates',           // Generate $templateCache file of HTML partials
        'build-app-css',            // Minify and concat app styles
        'build-min-bundle',
        'build:copy',               // Copies app folders into Build
        'build:static',             // Moves static imgs from assets into build/static
        'build:remove',             // Copy then Remove unneeded assets from build
        'build:version',            // Move assets into versioned build folder
        'build:index',              // Replace scripts in index.html
        'build:final-clean', cb);   // Remove app.min.js from build folder
});

gulp.task('version', ['build:getLastBuild'], function() {
    return generateNextVersion(env);
});

gulp.task('build:getLastBuild', function() {
    return fs.readdirSync(paths.lastBuild).filter(function(file) {
        if (file != 'static' && file != 'fonts') {
            lastVersion = file;
            process.stdout.write(gutil.colors.red.inverse(' Last version of build was: '+lastVersion+'                    \n'));
        }
    });
});

function generateNextVersion(ver) {
    var major, minor, patch;
    var versionArray = lastVersion.split('.');

    major = parseInt(versionArray[0]);
    minor = parseInt(versionArray[1]);
    patch = parseInt(versionArray[2]);

    switch (ver) {
        case 'major' : major += 1; break;
        case 'minor' : minor += 1; break;
        case 'patch' : patch += 1; break;
    }

    version = major + '.' + minor + '.' + patch;

    if (ver === '' || ver === undefined || ver === null) { version = '0.0.0'; }

    process.stdout.write(gutil.colors.blue.bold        ('######################################################     \n'));
    process.stdout.write(gutil.colors.blue.bold.inverse('           Building Admin version '+version+'              \n'));
    process.stdout.write(gutil.colors.green.italic     ('               All change is detectable                    \n'));
    process.stdout.write(gutil.colors.blue.bold        ('######################################################     \n'));
}

// Move files into new static folder \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:move-files', function() {
    return gulp.src('app/assets/pdfs/*')
        .on('error', errorlog)
        .pipe(gulp.dest('app/assets/static/'));
});

// HTML templateCache \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('html-templates', function() {
    return gulp.src(config.srcPartials)
        .pipe(templateCache('templateCache.js', { module:'templateCache', standalone:true }))
        .pipe(gulp.dest(config.destTemplateCache));
});

// Minify and concat app styles \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build-app-css', function() {
    return sass('sass-smacss/sass/admin.scss', { style: 'compressed' })
        .on('error', errorlog)
        .pipe(gulp.dest('build/assets/'+version+'css/'));
});

gulp.task('build-min-bundle', function() {
    return gulp.src(paths.default)
        .pipe(uglify({ mangle: false }))
        .pipe(stripDebug())
        .on('error', errorlog)
        .pipe(concat(minifiedApp))
        .pipe(gulp.dest('app/assets/js'));
});

// Copies app folders into Build \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:copy', function() {
    return gulp.src('app/**')
        .on('error', errorlog)
        .pipe(gulp.dest('build/'));
});

// Copy the assets into the build folder \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('build:static', ['build:cleanfolder'], function() {
    return gulp.src('app/assets/imgs/*')
        .on('error', errorlog)
        .pipe(gulp.dest('build/assets/static'));
});

// Compile the vendor libs \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('vendors', function() {
    return gulp.src(paths.vendors)
        // .pipe(uglify())
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest('./app/assets/js/libs/'));
});

// Task to remove unwated build files
// list all files and directories here that you don't want to include
gulp.task('build:remove', ['build:copy'], function(cb) {
    del([
        'build/api/',
        'build/helpers/',
        'build/auth/',
        'build/bulk/',
        'build/index/',
        'build/login/',
        'build/modals/',
        'build/nav/',
        'build/notifications/',
        'build/rest/',
        'build/settings/',
        'build/tags/',
        'build/tickers/',
        'build/users/'
    ], cb);
});

// Task to remove original assets
// Copies assets into versioned folder first:
gulp.task('build:version', ['build:assets'], function(cb) {
    del([
        'build/assets/css/',
        'build/assets/pdfs/',
        'build/assets/imgs/',
        'build/assets/js/'
    ], cb);
});

// Task to make the index file production ready
gulp.task('build:index', function() {

    process.stdout.write(gutil.colors.white.inverse(' New asset paths in markup:                           \n'));
    process.stdout.write(gutil.colors.yellow('  assets/'+version+'/css/admin.css\n'));
    process.stdout.write(gutil.colors.yellow('  assets/'+version+'/js/libs/vendors.min.js\n'));
    process.stdout.write(gutil.colors.yellow('  assets/'+version+'/js/admin.app.min.js\n'));

    gulp.src('app/index.html')
        .pipe(htmlReplace({
            'css'     : 'assets/'+version+'/css/admin.css',
            'vendors' : 'assets/'+version+'/js/libs/vendors.min.js',
            'bundle'  : 'assets/'+version+'/js/admin.app.min.js'
        }))
        .on('error', errorlog)
        .pipe(gulp.dest('build/'))
        .pipe(notify('Admin Build '+version+' created!'));
});

// Task to remove app.min from build
gulp.task('build:final-clean', ['build:move-bundle'], function(cb) {
    del([
        'assets',
        'build/assets/'+version+'/pdfs',
        'build/assets/'+version+'/static',
        'build/assets/'+version+'/libs',
        'build/assets/'+version+'/js/admin.app.js',
        'build/assets/libs',
        'build/overlay',
        'build/template',
        'build/templates',
        'build/topics',
        'build/admin.js',
        'build/admin.app.min.js',
        'build/assets/'+version+'/admin.app.js.map',
        'build/readme.md'
    ], cb)

    process.stdout.write(gutil.colors.blue.bold   ('######################################################     \n'));
    process.stdout.write(gutil.colors.blue.inverse('               Build '+version+' created!                  \n'));
    process.stdout.write(gutil.colors.blue.bold   ('######################################################     \n'));
});

gulp.task('build:move-bundle', function() {
    return gulp.src(paths.bundle)
        .pipe(uglify())
        .on('error', errorlog)
        .pipe(gulp.dest('build/assets/'+version+'/js'));
});

// Clear out all files and folders from build folder:
gulp.task('build:cleanfolder', function(cb) {
    del(['build/**'], cb);
});

// Task to move assets into versioned folder:
gulp.task('build:assets', function() {
    return gulp.src('build/assets/**')
        .on('error', errorlog)
        .pipe(gulpif(env != '', gulp.dest('build/assets/'+version)));
});

// Main Gulp Tasks \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
gulp.task('webpack', function() {
    return gulp.src('entry.js')
        .pipe(webpack( require('./webpack.config.js') ))
        .pipe(gulp.dest('app/assets/js'));
});

// Watch Tasks /////////////////////////////////////////////////////////////////
gulp.task('task-css', function() {
    return sass('sass-smacss/sass/admin.scss', { style: 'compressed' })
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('app/assets/css/'));
});

gulp.task('watch', function() {
    gulp.watch('app/**/*.html', ['html-templates']).on('change', function(file) {
        gutil.log(gutil.colors.yellow.bold('HTML updated' + ' (' + file.path + ')'));
    });

    gulp.watch('sass-smacss/sass/**/*.scss', ['task-css']).on('change', function(file) {
        gutil.log(gutil.colors.cyan('CSS updated' + ' (' + file.path + ')'));
    });

    gulp.watch(paths.scripts, ['webpack']).on('change', function(file) {
        gutil.log(gutil.colors.red.bold('JavaScript updated' + ' (' + file.path + ')'));
    });
});

gulp.task('default', ['watch', 'webpack']);