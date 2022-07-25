require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const rabbitmq = require('rabbitmqcg-nxg-oih');
const log = require('../helpers/logger');
const {readPool} = require('../helpers/query');
const app = express();

app.use(express.json());
//oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.get('/', (req, res) => {
	res.send('Service ready.');
});

app.post('/', async (req, res) => {
	
	try {
		log.info('Inside oracleConnector()');
        log.info('Config=' + req.body);

		//like to msg
		const {data} = req.body;
		const {cfg} = req.body;

		let properties = {
			database: null,
			host: null,
			password: null,
			port: null,
			query: null,
			user: null
		};

		if (!data) {
			return res.status(401).json(`${process.env.ERROR_PROPERTY} data`);
		}
		if (!cfg) {
			return res.status(401).json(`${process.env.ERROR_PROPERTY} cfg`);
		}

		Object.keys(properties).forEach((value) => {
			if (data.hasOwnProperty(value)) {
				properties[value] = data[value];
			} else if (cfg.hasOwnProperty(value)) {
				properties[value] = cfg[value];
			} else {
				log.error(`${process.env.ERROR_PROPERTY}, ${value}`);
				throw new Error(`${process.env.ERROR_PROPERTY}, ${value}`);
			}
		});
		
		await oracledb.createPool({
			user: properties.user,
			password: properties.password,
			connectString : `${properties.host}:${properties.port}/${properties.database}`
		});
		log.info('Connection pool started...');

		const _data = await readPool(properties);
		res.json(_data);
		
	} catch (e) {
		await rabbitmq.producerMessage(e);
		res.status(400).json(e);

	}
});

app.listen(3000, () => {
	log.info('Server running on port 3000...');
});


