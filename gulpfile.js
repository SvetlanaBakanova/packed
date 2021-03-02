const { src, dest, watch, parallel, series} = require("gulp");
const scss      = require("gulp-sass");
const prefix    = require("gulp-autoprefixer");
const sync      = require("browser-sync").create();
const imagemin  = require("gulp-imagemin");
// шрифты
const ttf2woff  = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
// include
const fi = require("gulp-file-include");

// создание файлов
const fs        = require("fs");


// files
function createFiles() {
    createFolders();
    setTimeout(() => {
        fs.writeFile("newfolder/index.html", "!", function (err) {
            if (err) {
                throw err;
            }
            console.log("File created")
        });
        fs.writeFile("newfolder/scss/style.scss", "", function (err) {
            if (err) {
                throw err;
            }
            console.log("File created")
        })
    }, 500);
}

// folders
function createFolders() {
    return src("*.*", { read: false })
    .pipe(dest("./newfolder/scss/"))
    .pipe(dest("./newfolder/js/"))
    .pipe(dest("./newfolder/img/"))
    .pipe(dest("./newfolder/fonts/"))
}

// dev
function convertStyles() {
    return src('app/scss/style.scss')
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(prefix({
            cascade: true,
            grid: true,
            flex: true
        }))
        .pipe(dest('app/css'))
};

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

// include
const fileinclude = function () {
    return src(["app/pages/**/*.html"])
        .pipe(
            fi({
                prefix: '@@',
                basepath: '@file'
        })
    )
    .pipe(dest("app"))
}

function watchFiles() {
    watch('app/scss/**/*.scss', convertStyles);

    watch('app/*.html').on("change", sync.reload)
    watch('app/css/*.css').on("change", sync.reload)

    watch('app/js/*.js').on("change", sync.reload)

    watch('app/_img', imageCompressed)

    // include
    watch('app/pages/**/*.html', fileinclude)

    // шрифты
    watch("app/fonts/*.ttf", series(convertFonts, fontsStyle))
}

exports.convertStyles   = convertStyles;
exports.watchFiles      = watchFiles;
exports.browserSync     = browserSync;
exports.imageCompressed = imageCompressed;
//  struct - для создания папок и файлов
exports.struct          = createFiles;


exports.default         = parallel(fileinclude, convertStyles, browserSync, watchFiles, series(convertFonts, fontsStyle));

// Bulid
function novehtml() {
    return src('app/*.html')
    .pipe(dest('dist'))
}

function moveCss() {
    return src('app/css/*.css')
    .pipe(dest('dist/css'))
}

function moveJS() {
    return src('app/js/*.js')
    .pipe(dest('dist/js'))
}

function moveImgs() {
    return src('app/img/*')
    .pipe(dest('dist/img'))
}
exports.novehtml    = novehtml;
exports.moveCss     = moveCss;
exports.moveJS      = moveJS;
exports.moveImgs    = moveImgs;
exports.fileinclude = fileinclude;

exports.bulid    = series(novehtml, moveCss, moveJS, moveImgs);

// ф-ция для конвертации шрифтов
function convertFonts() {
    src(["app/fonts/**.ttf"])
        .pipe(ttf2woff()).pipe(dest("app/fonts/"));
    return src(["app/fonts/**.ttf"])
        .pipe(ttf2woff2())
        .pipe(dest("app/fonts/"));
}

// Конвертировать ttf шрифты
exports.fontsStyle   = fontsStyle;
exports.convertFonts = convertFonts;

//! Font Face для шрифтов
const cb = () => {};

let srcFonts = "app/scss/_fonts.scss";
let appFonts = "app/fonts";

function fontsStyle() {
    let file_content = fs.readFileSync(srcFonts);

    fs.writeFile(srcFonts, "", cb);
    fs.readdir(appFonts, function (err, items) {
        if (items) {
            let c_fontname;
            for (let i = 0; i < items.length; i++) {
                let fontname = items[i].split(".");
                fontname = fontname[0];
                if (c_fontname != fontname) {
                    fs.appendFile(
                        srcFonts,
                        '@include font-face("' +
                            fontname +
                            '", "' +
                            fontname +
                            '", 400);',
                        cb
                    );
                }
                c_fontname = fontname;
            }
        }
    });
}