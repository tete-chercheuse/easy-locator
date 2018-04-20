// Grab our gulp packages
var gulp  = require('gulp'),
    browserSync = require('browser-sync').create(),
    path = require('path');


// ----- Variables -----

var projectDir = path.resolve(__dirname);

// ----- Browser-Sync watch files and inject changes -----

gulp.task('browsersync', function() {

	browserSync.init(projectDir + '/**/*', {
		proxy: 'http://easylocator.test/',
		ghostMode: false
	});
});

// ----- Default Task -----

gulp.task('default', function() {
	gulp.start('browsersync');
});
