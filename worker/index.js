const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
	...keys.redis,
	retry_strategy: () => 1000,
});
const sub = redisClient.duplicate();

const fib = (index) => {
	if (index < 2) return;
	return fib(index - 1) + fib(index - 2);
};

sub.on('message', (_, message) => {
	redisClient.set('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
