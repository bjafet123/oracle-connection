const log = require('./logger');
const oracledb = require("oracledb");

async function readPool(properties) {
    return new Promise(async (resolve, reject) => {
        let oraconnect;
        log.info('Connection pool started...');
        await oracledb.createPool({
            user: properties.user,
            password: properties.password,
            connectString: `${properties.host}:${properties.port}/${properties.database}`
        });
        try {
            oraconnect = await oracledb.getConnection();
            if (!oraconnect) {
                reject('No connection established.');
            }
            resolve(oraconnect.execute(properties.query));
        } catch (e) {
            reject(e);
        } finally {
            oraconnect.release();
        }
    });
}

module.exports = {readPool};