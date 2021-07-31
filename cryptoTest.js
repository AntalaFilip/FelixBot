const crypto = require('crypto');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
	console.log(`Primary ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
}
else {
	console.log(`Worker ${process.pid} started`);
	main();
}

async function main() {
	const g = [];
	while (true) {
		const gen = crypto.randomBytes(4).toString('hex');
		if (g.includes(gen)) {
			console.log(`Match found! ${g.length}`);
			g.splice(0);
		}
		else g.push(gen);
	}
}