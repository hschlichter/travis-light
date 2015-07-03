'use strict';

var immutable = require('immutable');
var request = require('request');

var url = 'https://api.travis-ci.com';
var headers = immutable.Map({
	'Accept': 'application/vnd.travis-ci.2+json',
	'Content-Type': 'application/json'
});

module.exports.authenticate = function (token) {
	return new Promise(function (resolve, reject) {
		request({
			method: 'POST',
			url: url + '/auth/github',
			headers: headers.toObject(),
			json: true,
			body: {
				'github_token': token
			}
		}, function (error, response, body) {
			if (error) {
				reject(error);
			}

			resolve(response.body.access_token);
		})
	});
};

module.exports.getBranch = function (accessToken, organization, repository, branch) {
	return new Promise(function (resolve, reject) {
		request({
			method: 'GET',
			url: url + '/repos/' + organization + '/' + repository + '/branches/' + branch,
			headers: headers.set('Authorization', 'token "' + accessToken + '"').toObject()
		}, function (error, response, body) {
			if (error) {
				reject(error);
			}

			resolve(JSON.parse(response.body));
		});
	});
};

module.exports.isBranchOk = function (branch) {
	return branch.branch.state === 'passed';
};

module.exports.isBranchFailed = function (branch) {
	var failingStates = {
		'failed': true,
		'errored': true
	};

	return branch.branch.state in failingStates;
};

module.exports.isBranchBuilding = function (branch) {
	var buildingStates = {
		'received': true,
		'created': true,
		'started': true
	};

	return branch.branch.state in buildingStates;
};
