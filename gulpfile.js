// grab the gulp packages
var gulp = require('gulp'),
		gutil = require('gulp-util'),
		sass = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		jshint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		bourbon = require('node-bourbon').includePaths,
		neat = require('node-neat').includePaths,
		browserSync = require('browser-sync').create();

// compile sass task
gulp.task('sass', function() {
	return gulp.src('src/scss/**/*.scss')
	.pipe(sass({
		includePaths: bourbon,
		includePaths: neat
	}).on('error', sass.logError))
	.pipe(autoprefixer())
	.pipe(gulp.dest('build/styles/'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

// compile js files
gulp.task('js', function() {
	return gulp.src('src/scripts/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'))
	.pipe(gulp.dest('build/scripts/'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

// copy html from src to build
gulp.task('copyHtml', function() {
	gulp.src('src/*.html')
	.pipe(gulp.dest('build/'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

// browser-sync config
gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'build'
		}
	});
});

// watch task for auto-updates
gulp.task('watch', ['browserSync', 'sass', 'js', 'copyHtml'], function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('src/scripts/**/*.js', ['js']);
	gulp.watch('src/**/*.html', ['copyHtml']);
});

// create default task 
gulp.task('default', function() {
	// return gutil.log('Gulp is running!')
});