var gulp    = require('gulp'),
		sourcemaps  = require('gulp-sourcemaps'),
		browserify  = require('browserify'),
		buffer      = require('vinyl-buffer'),
		source      = require('vinyl-source-stream'),
		_           = require('lodash'),
		del 				= require('del'),
		browserSync = require('browser-sync').create(),
		argv        = require('yargs').argv,
		dotenv		= require('dotenv').config();


var isProduction = (argv.production === undefined) ? false : true
var packageManifest = {};
try {
	packageManifest = require('./package.json');
} catch (e) {
	console.log ("loading package.json failed")
}

var name = packageManifest.name
var project = "./" + name + ".framer/";
var projectFolder = project;
var buildDirectory = './build/' + name + "/";
var ignorePackageList = ['avrgirl-arduino', 'http-serve', 'running-average', 'serialport', 'bridge'];

function clean() {
	return del("./build");
}

// Static server
function server() {
		browserSync.init({
				server: {
						baseDir: buildDirectory
				},
				port: 3010,
                // read browser from .env file, if not defined browsersync falls back to system default
                browser: process.env.BROWSER
		});
};

function customHtml() {
	return checkForProduction(projectFolder + 'custom-html/*.{js,html,json}', buildDirectory, customHtml);
};

function framer() {
	return checkForProduction(projectFolder + 'framer/framer.js', buildDirectory +'framer', framer);
};

function data() {
	return checkForProduction(projectFolder +'data/*', buildDirectory +'data', data);
};

function assets() {
	return checkForProduction(projectFolder +'assets/*', buildDirectory +'assets', assets);
};

function framerInit() {
	return checkForProduction(projectFolder +'framer/framer.init.js', buildDirectory +'framer', framerInit);
};

function framerGenerated() {
	return checkForProduction(projectFolder +'framer/framer.generated.js', buildDirectory +'framer', framerGenerated);
};

function framerVekter() {
	return checkForProduction(projectFolder +'framer/framer.vekter.js', buildDirectory +'framer', framerVekter);
};

function designVekter() {
	return checkForProduction(projectFolder +'framer/design.vekter', buildDirectory +'framer', designVekter);
};

function imported() {
	return checkForProduction(projectFolder+'imported/**/*.*', buildDirectory+'imported/', imported);
};

function css() {
	return checkForProduction(projectFolder + 'framer/style.css', buildDirectory+'framer', css);
};

function images() {
	return checkForProduction(projectFolder+'framer/images/**/*.*', buildDirectory+'framer/images', images);
};

function vendor() {
	return browserify()
		.require(getNPMPackageIds())
		.bundle()
		.on('error', function(err){
			throw new Error(err.message)
		})
		.pipe(source('vendor.js'))
		.pipe(gulp.dest(buildDirectory));
};

function coffee() {
	var b =  browserify({
			entries: [projectFolder+'app.coffee'],
			debug: !isProduction,
			extensions: [".coffee", ".js"],
			paths: [projectFolder+'modules'],
			transform: ["coffeeify"]
		})
	getNPMPackageIds().forEach(function (id) {
		b.external(id);
	});

	return b.bundle()
	.on('error', function(err){
		throw new Error(err.message)
	})
	.pipe(source('framer.modules.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: !isProduction, debug: !isProduction}))
	.pipe(sourcemaps.write("./"))
	.pipe(gulp.dest(buildDirectory));
};


function reload(done) {
	browserSync.reload();
	done();
};


function watch() {
	gulp.watch('./package.json', gulp.series(vendor, function triggerReload(done) {reload(done)}));
	gulp.watch(projectFolder + 'custom-html/*', gulp.series(customHtml, function triggerReload(done) {reload(done)}));
	gulp.watch(projectFolder + 'modules/**/*.{coffee,js}', gulp.series(coffee, function triggerReload(done) {reload(done)}));
	gulp.watch(projectFolder + 'data/*', gulp.series(data, function triggerReload(done) {reload(done)}));
	gulp.watch(projectFolder + 'framer/design.vekter', gulp.series(framerVekter, designVekter, function triggerReload(done) {reload(done)}));
	gulp.watch(projectFolder + 'imported/**/*',  gulp.series(imported, function triggerReload(done) {reload(done)}));
	gulp.watch(projectFolder + 'images/**/*.*',  gulp.series(images, function triggerReload(done) {reload(done)}));
};

function getNPMPackageIds() {
	try {
		ignorePackageList
			.forEach( (package) => delete packageManifest.dependencies[package] );
	} catch (e) {
		console.log("no manifest", e);
	}
	return _.keys(packageManifest.dependencies) || [];
}

function checkForProduction(from, to, taskName) {
	if (isProduction){
		return gulp.src(from, {since: gulp.lastRun(taskName)})
			.pipe(gulp.dest(to));
	} else {
		return gulp.src(from, {since: gulp.lastRun(taskName)})
		.pipe(gulp.symlink(to));
	}
}

var build = gulp.series(clean, gulp.parallel(
	vendor, coffee,
	css, images,
	data, assets,
	framer, framerInit,
	framerGenerated, framerVekter,
	designVekter, imported,
	customHtml
));

gulp.task('clean', clean);
gulp.task('build', build);
gulp.task('default', gulp.series(build, gulp.parallel(watch, server)));


exports.watch = watch;
