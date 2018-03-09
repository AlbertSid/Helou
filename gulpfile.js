


var gulp = require('gulp'),
    browserSync = require("browser-sync").create('haolou');

gulp.task("default", function() {
    browserSync.init({
        server: "./"
    });
    gulp.watch(["views/*.html", "assets/v**/*"]).on("change", function() {
        browserSync.reload;
    });
});