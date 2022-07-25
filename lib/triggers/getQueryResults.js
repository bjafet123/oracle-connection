const log = require('../../helpers/logger');
const rabbitmq = require('rabbitmqcg-nxg-oih');
const {readPool} = require('../../helpers/query');

const ERROR_PROPERTY = 'Error missing property';

const oracleConnector = async function (msg, cfg, snapshot = {}) {
    try {

        log.info('Inside processTrigger()');
        log.info('Msg=', JSON.stringify(msg));
        log.info('Config=', JSON.stringify(cfg));
        log.info('Snapshot=', JSON.stringify(snapshot));

        let {data} = msg;

        let properties = {
            database: null,
            host: null,
            password: null,
            port: null,
            query: null,
            user: null
        };

        if (!data) {
            this.emit('error', `${ERROR_PROPERTY} data`);
            throw new Error(`${ERROR_PROPERTY} data`);
        }

        Object.keys(properties).forEach((value) => {
            if (data.hasOwnProperty(value)) {
                properties[value] = data[value];
            } else if (cfg.hasOwnProperty(value)) {
                properties[value] = cfg[value];
            } else {
                log.error(`${ERROR_PROPERTY} ${value}`);
                throw new Error(`${ERROR_PROPERTY} ${value}`);
            }
        });

        snapshot.lastUpdated = snapshot.lastUpdated || new Date();

        const _data = await readPool(properties);

        if (_data.length > 0) {
            this.emit('data', {data: _data});
            snapshot.lastUpdated = new Date();
            log.info(`New snapshot: ${snapshot.lastUpdated}`);
            this.emit('snapshot', snapshot);
        } else {
            this.emit('snapshot', snapshot);
            this.emit('data', {data: 'Query successfully executed'});
        }

        log.info('Finished execution');
        this.emit('end');
    } catch (e) {
        log.error(`ERROR: ${e}`);
        this.emit('error', e);
        await rabbitmq.producerErrorMessage(msg.toString(), e.toString());
    }
}


module.exports = {
    oracleConnector
}
