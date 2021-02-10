const {src, dest, watch, parallel, series} = require("gulp");
const scss = require("gulp-sass");
const prefix = require("gulp-autoprefixer");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");

function convertStyles() {
    return src('app/scss/style.scss')
        .pipe(scss(
            {
                outputStyle: 'compressed'
            }
        ))
        .pipe(prefix({
            cascade: true,
            grid: true,
            flex: true
        }))
    .pipe(dest('app/css'))
};

function uglifyJS() {
    return src('app/js/draft/*.js')
        .pipe(uglify())
        .pipe(dest('app/js'))
}

function imageCompressed() {
    return src('app/_img/*.{jpg,png,svg}')
        .pipe(imagemin())
        .pipe(dest('app/img'))
}

function browserSync() {
    sync.init({
        server: {
            baseDir: "app",
            open: "local"
        }
    });
}

function watchFiles() {
    watch('app/scss/**/*.scss', convertStyles);

    watch('app/*.html').on("change", sync.reload)
    watch('app/css/*.css').on("change", sync.reload)

    watch('app/js/*.js').on("change", sync.reload)
    
    watch('app/js/draft/*.js', uglifyJS)

    watch('app/_img', imageCompressed)
}

exports.convertStyles = convertStyles;
exports.watchFiles = watchFiles;
exports.browserSync = browserSync;
exports.imageCompressed = imageCompressed;
exports.uglifyJS = uglifyJS;

exports.default = parallel(convertStyles, uglifyJS, browserSync, watchFiles);