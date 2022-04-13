module.exports = {
	redis: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	},
	pg: {
		database: process.env.PG_DATABASE,
		host: process.env.PG_HOST,
		password: process.env.PG_PASSWORD,
		port: process.env.PG_PORT,
		user: process.env.PG_USER,
	},
};
