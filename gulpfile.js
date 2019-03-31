const gulp = require('gulp');
const {series , watch ,task} = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('autoprefixer'); //添加css兼容性写法
const inlinesource = require('gulp-inline-source');
const htmlmin = require('gulp-htmlmin');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const del = require('del');
var rename = require("gulp-rename");

gulp.task('clean', () =>
  del(['./dist/*']).then(function () {
    console.log('delete unnecessary files for firecrackers');
  })
);

gulp.task('js', () =>
  gulp.src(['./src/app.js', './src/app2.js'])
    .pipe(concat('app.js'))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env'],
      plugins: ['@babel/transform-runtime']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist')) // 将源文件拷贝到打包目录
    .pipe(rev())
    .pipe(gulp.dest('dist')) // 将生成的hash文件添加到打包目录
    .pipe(rev.manifest('js-rev.json'))
    .pipe(gulp.dest('dist')) // 将map映射文件添加到打包目录
);

gulp.task('css', () =>
  gulp.src('./src/*.css')
    .pipe(postcss([autoprefixer({
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9',
        'iOS >= 8',
        'Android > 4.4'
      ],
      flexbox: 'no-2009',
    })]))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist')) // 将生成的hash文件添加到打包目录
    .pipe(rev())
    .pipe(gulp.dest('dist'))// write rev'd assets to build dir
    .pipe(rev.manifest('css-rev.json'))
    .pipe(gulp.dest('dist'))   // 将map映射文件添加到打包目录

);

gulp.task('html', () => {
  const jsManifest = gulp.src('dist/js-rev.json'); //获取js映射文件
  const cssManifest = gulp.src('dist/css-rev.json'); //获取css映射文件
  return gulp.src('./*.html')
    .pipe(revRewrite({manifest: jsManifest})) // 把引用的js替换成有版本号的名字
    .pipe(revRewrite({manifest: cssManifest})) // 把引用的css替换成有版本号的名字
    .pipe(inlinesource()).pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true
    }))
    .pipe(rename({
      dirname: ".",                // 路径名
      basename: "index",            // 主文件名
      prefix: "pre-",                 // 前缀
      suffix: "-min",                 // 后缀
      extname: ".html"                // 扩展名
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', series('clean', 'js', 'css', 'html'))

gulp.task('watch', ()=>{
  gulp.watch('src/**', gulp.series('default'))
})