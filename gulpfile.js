/*
 * @Date: 2015-12-01 18:19:10
 * @Author: mkyo <ejbscm@hotmail.com>
 * @Description: If you have some questions, please contact: ejbscm@hotmail.com.
 */
const path = require("path"),
    fs = require('fs'),
    gulp = require("gulp"),
	del = require('del'),
    minifycss = require("gulp-minify-css"),
    uglify = require("gulp-uglify"),
	zip = require('gulp-zip'),
    minifyHtml = require("gulp-minify-html"),
    replace = require('gulp-replace'),
    unzip = require('gulp-unzip'),
    jshint = require("gulp-jshint"),
    stylish = require('jshint-stylish'),
    htmlhint = require("gulp-htmlhint"),
    plumber = require('gulp-plumber');

let config = require('./config.json');
const customCfgFile = process.env.config;
if(customCfgFile && fs.exists(customCfgFile)){
    Object.assign(
        config,
        JSON.parse(fs.readFileSync(customCfgFile))
    );
}
const tmpDir = process.env.tmpDir || './tmp';

Object.keys(config).forEach(function (key) {
    config[key].forEach(function (val, i, arr) {
        arr[i] = path.join(tmpDir, val);
    });
});

function getVersion() {
    return process.env.version || new Date().getTime();
}

gulp.task('del:tmp',function(cb){
    del([tmpDir], cb);
});

gulp.task('unzip', ['del:tmp'],function(){
	return gulp.src(process.env.source)
    .pipe(unzip())
    .pipe(gulp.dest(tmpDir));
});

gulp.task("minifycss",function () {
    return gulp.src(config.css)
        .pipe(plumber())
        .pipe(minifycss())
        .pipe(gulp.dest(tmpDir));
});

// 添加公共bootstrap.js公共请求版本
gulp.task("addjs:version", function () {
    return gulp.src(config.btjs)
		.pipe(replace(/([^\s!\\]+(?=\.(js|css))\.\2)/gi, '$&?v='  + getVersion()))
        .pipe(gulp.dest(tmpDir));
});

// 添加html请求js,css版本
gulp.task('addhtml:version', function(){
    gulp.src(config.html)
        .pipe(replace(/([^\s!\\]+(?=\.(js|css)("|'))\.\2)/gi, '$&?v='  + getVersion()))
      .pipe(gulp.dest(tmpDir));
  });

gulp.task("add-version",function(cb){
	gulp.start("addjs:version", "addhtml:version");
});

gulp.task("uglifyjs",["addjs:version"], function () {
    return gulp.src(config.js)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(tmpDir));
});
 
gulp.task('minifyHtml', function(){
  gulp.src(config.html)
	  .pipe(replace(/([^\s!\\]+(?=\.(js|css)("|'))\.\2)/gi, '$&?v='  + getVersion()))
      .pipe(minifyHtml())
    .pipe(gulp.dest(tmpDir));
});

gulp.task("compile",function(cb){
	gulp.start("minifycss", "uglifyjs","minifyHtml");
});

gulp.task("build",["unzip"],function(cb){
	gulp.start("minifycss", "uglifyjs","minifyHtml");
});

gulp.task('zip',function() {
   return gulp.src(tmpDir + '/**')
     .pipe(zip(process.env.zipName + '.war'))
	 .pipe(gulp.dest(process.env.output || './output'));
});

gulp.task("package",['zip'],function(cb){
	del([tmpDir], cb);
});

// todo 检测js 语法
gulp.task("check-js",function () {
     gulp.src(config.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('check-html',function(){
    gulp.src(config.html)
        .pipe(plumber()) 
        .pipe(htmlhint())
        .pipe(htmlhint.reporter("htmlhint-stylish"))
        .pipe(htmlhint.failReporter({ suppress: true }));
});

