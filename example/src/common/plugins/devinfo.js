// 输出开发信息
window.showDevInfo = function(options = [], F = 'log', ...data) {
    const desc = [];
    const descStyle = [];

    options.map(function(conf) {
        // color backgroundColor text
        desc.push(conf.text);
        descStyle.push(`background:${conf.backgroundColor};padding:1px;color:${conf.color};`);
    });

    descStyle[0] += 'border-radius:3px 0 0 3px;';
    descStyle[descStyle.length - 1] += 'border-radius:0 3px 3px 0;';

    console[F]('%c ' + desc.join(' %c ') + ' ', ...descStyle, ...data);
};

window.showDevInfo([
    {
        text           : 'IceGulp Dev CLI',
        backgroundColor: '#35495E',
        color          : '#FFF'
    },
    {
        text           : `Detected lastest version is v2.3.7`,
        backgroundColor: '#EF5D5D',
        color          : '#FFF'
    }
]);
