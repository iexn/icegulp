const htmlmin      = require("gulp-htmlmin");
const babel        = require("@babel/core");
const sass         = require("node-sass");
const UglifyJS     = require("uglify-js");
const app = require('icegulp/register').getApp('web');

app.register('html', function (stream) {
    stream = stream
        .pipe(htmlmin({
            // removeComments: true,  // 清除HTML注释
            // collapseWhitespace: true,  // 压缩HTML
            // collapseBooleanAttributes: true,  // 省略布尔属性的值 <input checked="true"/> ==> <input checked />
            // removeEmptyAttributes: true,  // 删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,  // 删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,  // 删除<style>和<link>的type="text/css"

            // 压缩页面JS
            minifyJS: function (text, inline) {
                if (!text) {
                    return "";
                }

                var result = babel.transformSync(text, {
                    presets: ["@babel/env"]
                });

                return UglifyJS.minify(result.code).code + ";";
            },

            // 压缩css
            minifyCSS: function (text, inline) {
                if (!text) {
                    return "";
                }
                
                // 如果是内联样式不做处理
                if (inline != "inline") {
                    var result = sass.renderSync({
                        data: text,
                        outputStyle: "compact",
                        indentWidth: 4
                    });

                    text = result.css.toString();
                    text = "\n" + text.replace(/\n\n/g, "\n");
                }
        
                return text;
            }
        }))
      
    return app.destTask(stream, app.name);
});

module.exports = app;
