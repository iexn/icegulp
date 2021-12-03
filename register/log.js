const Log = function () {};
const _this = Log.prototype;

_this.print = function () {
    const date = (nd => `${nd.getHours()}:${nd.getMinutes()}:${nd.getSeconds()}`)(new Date);

    console.log('\x1B[35m['+ date +']\x1B[0m', '\x1B[36mIceGulp\x1B[0m', '-', ...arguments);
}

_this.error = function () {
    const date = (nd => `${nd.getHours()}:${nd.getMinutes()}:${nd.getSeconds()}`)(new Date);
    
    console.error('\x1B[35m['+ date +']\x1B[0m', '\x1B[36mIceGulp\x1B[0m', '-', ...arguments);
}

module.exports = new Log;