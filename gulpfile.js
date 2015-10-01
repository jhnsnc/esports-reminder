//general
var gulp = require('gulp');
var del = require('del');
var copy = require('gulp-copy');

//sass
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifyCss = require('gulp-minify-css');

//javascript
var uglify = require('gulp-uglify');

//////////////////////////////////////////////////
// Primary Tasks
//////////////////////////////////////////////////

gulp.task('build', ['build:css', 'build:img', 'build:js']);
gulp.task('deploy', ['clean'], function() { gulp.start('build'); });
gulp.task('build-debug', ['build-debug:css', 'build-debug:img', 'build-debug:js']);
gulp.task('watch', ['build-debug', 'watch:css', 'watch:img', 'watch:js']);

//wipe public directory
gulp.task('clean', ['clean:css', 'clean:img', 'clean:js']);

//////////////////////////////////////////////////
// Config
//////////////////////////////////////////////////

var config = {
	cssSrcDir: 'client-src/scss',
	cssDestDir: 'public/css',
	autoprefixOptions: {
		browsers: ['> 1%', 'last 2 versions'],
		cascade: true,
		remove: true
	},
	imgSrcDir: 'client-src/img',
	imgDestDir: 'public/img',
	jsSrcDir: 'client-src/js',
	jsDestDir: 'public/js'
};

//////////////////////////////////////////////////
// Task Details
//////////////////////////////////////////////////

//styles

gulp.task('clean:css', function(cb) {
	var files = config.cssDestDir + '/**/*.*';
	del(files, cb);
});

gulp.task('build:css', function() {
	var files = config.cssSrcDir + '/**/*.scss';

	gulp.src(files)
		.pipe(sass.sync({
			outFile: 'maintenance.css',
			outputStyle: 'nested'
		}).on('error', sass.logError))
		.pipe(autoprefixer(config.autoprefixOptions))
		.pipe(minifyCss())
		.pipe(gulp.dest(config.cssDestDir));
});

gulp.task('build-debug:css', function() {
	var files = config.cssSrcDir + '/**/*.scss';

	gulp.src(files)
		.pipe(sass.sync({
			outFile: 'maintenance.css',
			outputStyle: 'nested',
			sourceComments: true,
			sourceMap: true,
			souceMapEmbed: true
		}).on('error', sass.logError))
		.pipe(autoprefixer(config.autoprefixOptions))
		.pipe(gulp.dest(config.cssDestDir));
});

gulp.task('watch:css', function() {
	var files = config.cssSrcDir + '/**/*.*';
	gulp.watch(files, ['build-debug:css']);
});

//images

gulp.task('clean:img', function(cb) {
	var files = config.imgDestDir + '/**/*.*';
	del(files, cb);
});

gulp.task('build:img', function() {
	var files = config.imgSrcDir + '/**/*.{svg,png,jpg,gif}';

	gulp.src(files)
		.pipe(copy(config.imgDestDir, {prefix: 2}));
});

gulp.task('build-debug:img', function() {
	var files = config.imgSrcDir + '/**/*.{svg,png,jpg,gif}';

	//copy SVGs/PNGs/JPGs/GIFs (no compression for build-debug)
	gulp.src(files)
		.pipe(copy(config.imgDestDir, {prefix: 2}));
});

gulp.task('watch:img', function() {
	var files = config.imgSrcDir + '/**/*.*';
	gulp.watch(files, ['build-debug:img']);
});

//javascript

gulp.task('clean:js', function(cb) {
	var files = config.jsDestDir + '/**/*.*';
	del(files, cb);
});

gulp.task('build:js', function() {
	var files = config.jsSrcDir + '/**/*.js';

	//compress JS
	gulp.src(files)
		.pipe(uglify())
		.pipe(gulp.dest(config.jsDestDir));
});

gulp.task('build-debug:js', function() {
	var files = config.jsSrcDir + '/**/*.js';

	//copy JS
	gulp.src(files)
		.pipe(copy(config.jsDestDir, {prefix: 2}));
});

gulp.task('watch:js', function() {
	var files = config.jsSrcDir + '/**/*.*';
	gulp.watch(files, ['build-debug:js']);
});