const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));

const {BlogPosts} = require('./models');

BlogPosts.create('My First Blog Post', 'Hi. This is my first test blog post. Hey look, it works!', 'Daniel');

app.get('/', (req, res) => {
	res.json(BlogPosts.get());
});

app.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \'${field}\' in request body.`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	let post = "";
	if (req.body.date) {
		post = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.date);
	}
	else {
		post = BlogPosts.create(req.body.title, req.body.content, req.body.author);
	}
	console.log(`Posted entry '${req.params.title}' to blog.`);
	res.status(201).json(post);
});

app.put('/:id', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \'${field}\' in request body.`
			console.error(message);
			console.log(message);
			return res.status(400).send(message);
		}
	}
	let updatedEntry = BlogPosts.update({
		title: req.body.title, 
		content: req.body.content,
		author: req.body.author,
		id: req.params.id,
		date: req.body.date || Date.now()
	});
	console.log(`Updated entry '${req.body.title}' on blog.`);
	res.status(204).json(updatedEntry);
});

app.delete('/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted post '${req.params.id}' from blog.`);
	res.status(204).end();
});


// Functions and exports to run and close the server from test files
const server;

function runServer() {
	const port = process.env.PORT || 8080;
	return new Promise((resolve, reject) => {
		server = app.listen(port, () => {
			console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
			resolve(server);
		}).on('error', err => {
			reject(err);
		});
	});
}

function closeServer() {
	return new Promise((resolve, reject) => {
		console.log("Closing server.");
		server.close(err => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};