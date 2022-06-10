require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const app = express();

app.use(express.json());
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.get("/", (req, res) => {
	res.send("Service ready.");
});

app.post("/", async (req, res) => {
	
	try {
		console.log("Inside oracleConnector()");
        console.log("Config=" + req.body);
		
		let oraconnect;
		let {
				query, 
				host,
				user,
				password,
				database,
				port
			} = req.body;
		
		if (!host) {
			return res.status(400).json({msg: 'Database host parameter missing.'});
		}
		if (!user) {
			return res.status(400).json({msg: 'Database user name parameter missing.'});
		}
		if (!password) {
			return res.status(400).json({msg: 'Database password parameter missing.'});
		}
		if (!database) {
			return res.status(400).json({msg: 'Database name parameter missing.'});
		}
		if (!port) {
			return res.status(400).json({msg: 'Database port parameter missing.'});
		}
		
		await oracledb.createPool({
			user,
			password,
			connectString : `${host}:${port}/${database}`
		});
		console.log('Connection pool started...');
		
		if (!query) {
			return res.status(400).json({msg: 'No query to be excecuted.'});
		}
		
		oraconnect = await oracledb.getConnection();
		if(!oraconnect) {
			return res.status(400).json({msg: 'No connection established.'});
		}
		const result = await oraconnect.execute(query);
		res.json(result.rows);
		
	} catch (err) {
		res.status(400).json(err);
	} finally {
		if (oraconnect) {
			try {
				await oraconnect.release();
			} catch (err) {
				console.error(err);
			}
		}
	}
});

app.listen(3000, () => {
	console.log("Server running on port 3000...");
});


