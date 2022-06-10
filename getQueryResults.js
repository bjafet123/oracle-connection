require('@openintegrationhub/ferryman');
const oracledb = require('oracledb');

const oracleConnector = async (msg, cfg, snapshot = {}) => {
    try {

        console.log("Inside oracleConnector()");
        console.log("Config=" + cfg);

		let oraconnect;
        let {
            query, 
			host,
			user,
			password,
			database,
			port
        } = cfg;

		if (!host) {
			this.emit('error', 'Database host parameter missing.');
			throw new Error('Database host parameter missing.');
		}
		if (!user) {
			this.emit('error', 'Database user name parameter missing.');
			throw new Error('Database user name parameter missing.');
		}
		if (!password) {
			this.emit('error', 'Database password parameter missing.');
			throw new Error('Database password parameter missing.');
		}
		if (!database) {
			this.emit('error', 'Database name parameter missing.');
			throw new Error('Database name parameter missing.');
		}
		if (!port) {
			this.emit('error', 'Database port parameter missing.');
			throw new Error('Database port parameter missing.');
		}

        await oracledb.createPool({
			user,
			password,
			connectString : `${host}:${port}/${database}`
		});
		console.log('Connection pool started...');

		if (!query) {
			this.emit('error', 'No query to be excecuted.');
			throw new Error('No query to be excecuted.');
		}

        snapshot.lastUpdated = snapshot.lastUpdated || new Date();

        async function get_data() {
           
			try {
				oraconnect = await oracledb.getConnection();
				if(!oraconnect) {
					this.emit('error', 'No connection established.');
					throw new Error('No connection established.');
				}
				return await oraconnect.execute(query);
			} catch (err) {
				console.log(`ERROR: ${e}`);
        		this.emit('error', e);
			} finally {
				if (oraconnect) {
					try {
						await oraconnect.release();
					} catch (err) {
						console.error(err);
					}
				}
			}
        }

        const data = await get_data();

        if (data.length > 0) {
            data.forEach(r => {
                const emitData = {data: r};
                this.emit('data', emitData);
            });
            snapshot.lastUpdated = new Date();
            console.log(`New snapshot: ${snapshot.lastUpdated}`);
            this.emit('snapshot', snapshot);
        } else {
            this.emit('snapshot', snapshot);
        }

        console.log('Finished execution');
        this.emit('end');
    } catch (e) {
        console.log(`ERROR: ${e}`);
        this.emit('error', e);
    }
}


module.exports = {
    oracleConnector
}
