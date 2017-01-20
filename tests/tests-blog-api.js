const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('Blog', function() {
	before(function() {
		return runServer();
	});

	after(function() {
		return closeServer();
	});

	it('should return blog posts on GET', function() {
		return chai.request(app)
		.get('/')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.length.should.be.at.least(1);

			const expectedKeys = ['id', 'title', 'author', 'content', 'publishDate'];
			res.body.forEach(function(post) {
				post.should.be.a('object');
				post.should.include.keys(expectedKeys);
			});
		});
	});

	it('should add an item on POST', function() {
		const newPost = {
			"title": "Posted Entry", 
			"author": "Daniel", 
			"content": "This entry added using POST function.",
		};
		return chai.request(app)
		.post('/')
		.send(newPost)
		.then(function(res) {
			res.should.have.status(201);
			res.should.be.json;
			res.body.should.be.a('object');
			const expectedKeys = ['id', 'title', 'author', 'content', 'publishDate'];
			res.body.should.include.keys(expectedKeys);
			res.body.id.should.not.be.null;
			res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id, publishDate: res.body.publishDate}));
		});
	});

	it('should update items on PUT', function() {
		const updatePost = {
			"title": "Updated Entry", 
			"author": "Daniel", 
			"content": "This entry updated using PUT function.",
			"publishDate": Date.now()
		};

		return chai.request(app)
		.get('/')
		.then(function(res) {
			updatePost.id = res.body[0].id;
			return chai.request(app)
			.put(`/${updatePost.id}`)
			.send(updatePost);
		}).then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.deep.equal(Object.assign(updatePost, {publishDate: res.body.publishDate}));
		});
	});

	it('should delete items on DELETE', function() {
		let id = undefined;
		return chai.request(app)
		.get('/')
		.then(function(res) {
			id = res.body[0].id;
			return chai.request(app)
			.delete(`/${id}`);
		}).then(function(res) {
			res.should.have.status(204);
		}).then(function(res) {
			return chai.request(app)
			.get('/')
			.then(function(res) {
				res.body.forEach(function (post) {
					post.id.should.not.equal(id);
				});
			});
		});
	});

});