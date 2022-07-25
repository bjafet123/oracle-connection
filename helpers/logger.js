const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const envData = {};
const formatOut = bformat({
    outputMode: 'long', /* , levelInString: true */
});
const log = bunyan.createLogger({
    name: 'app',
    streams: [
        {
            level: 'error',
            path: `error.log`
        },
        {
            level: 'trace',
            path: `logs.log`,
            stream: formatOut
        }
    ],
    level: 'trace',
    src: true
}).child(envData, true);

module.exports = log;
