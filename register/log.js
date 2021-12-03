const Log = function () {};
const _this = Log.prototype;

const full = num => num < 10 ? ('0' + num) : ('' + num);
const time = () => (nd => `${nd.getHours()}:${nd.getMinutes()}:${nd.getSeconds()}`)(new Date);

_this.print = function () {
    console.log('\x1B[35m['+ time() +']\x1B[0m', '\x1B[36mIceGulp\x1B[0m', '-', ...arguments);
}

_this.error = function () {
    console.error('\x1B[35m['+ time() +']\x1B[0m', '\x1B[36mIceGulp\x1B[0m', '-', ...arguments);
}

module.exports = new Log;