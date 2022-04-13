const cors = require('cors');
const express = require('express');
const parser = require('body-parser');
const redis = require('redis');
const { Pool } = require('pg');

const keys = require('./keys');

const app = express();
app.use(cors());
app.use(parser.json());

const pgClient = new Pool({ ...keys.pg });
pgClient.on('error', () => console.error('log connection with Postgres'));
pgClient
	.query(
		`
			CREATE TABLE IF NOT EXISTS 
			values (number INT)
		`
	)
	.catch((err) => console.log(err));

const redisClient = redis.createClient({ ...keys.redis, retry_strategy: () => 1000 });
const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
	res.send('Hi');
});

app.get('values/all', async (req, res) => {
	const values = await pgClient.query('SELECT * from values');

	res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
	redisClient.hgetall('values', (err, values) => {
		res.send(values);
	});
});

app.post('/values', async (req, res) => {
	const { index } = req.body;

	if (parseInt(index) > 40) {
		return res.status(422).send('Index too high');
	}

	redisClient.hset('values', index, 'Nothing yet!');
	redisPublisher.publish('insert', index);

	pgClient.query(
		`
			INSERT INTO values(number)
			VALUES($1)
		`,
		[index]
	);

	res.send({ working: true });
});

app.listen(5000, () => {
	console.log('Listening to port 5000');
});
