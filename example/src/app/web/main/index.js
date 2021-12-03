// = extend @app/.common/env/main.js
// ^ block:main

// = include ./api.js

layui.use(['layer', 'form'], function() {
    Create().nav(1);

    console.log('开始');
});

// $ block:main
