const gulp = require("gulp");
const tsc = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");

let tsProject = tsc.createProject("tsconfig.json");

gulp.task("build", function () {

    let ts = gulp.src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    
    ts.dts.pipe(gulp.dest("declarations/"));

    ts.js.pipe(sourcemaps.write("../maps"))
        .pipe(gulp.dest("build/"));

});

gulp.task("watch", function () {
    gulp.watch("src/**/*.ts", ["build"]);
});