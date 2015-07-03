'use strict';

var co = require('co');
var wait = require('co-wait');
var travis = require('./travis');
var lifxjs = require('lifx');
var config = require('./config.json');

var lifx = lifxjs.init();
lifx.on('bulb', function (bulb) {
	if (!bulb) {
		throw new Error('No bulb!');
	}

	lifx.lightsColour(0x0000, 0x0000, 0x0000, 0x0000, 0x0000, bulb);

	co(function *() {
		while (true) {
			var accessToken = yield travis.authenticate(config['github']['oauth_token']);
			var branch = yield travis.getBranch(
				accessToken,
				config['github']['organization'],
				config['github']['repository'],
				config['github']['branch']);

			if (travis.isBranchOk(branch)) {
				lifx.lightsColour(0x5555, 0xffff, 0x5555, 0x0dac, 0x0000, bulb);
			} else if (travis.isBranchFailed(branch)) {
				lifx.lightsColour(0xffff, 0xffff, 0x5555, 0x0dac, 0x0000, bulb);
			} else if (travis.isBranchBuilding(branch)) {
				lifx.lightsColour(0x2222, 0xffff, 0x2222, 0x0000, 0x0000, bulb);
				yield wait(500);
				lifx.lightsColour(0x2222, 0x8888, 0x1111, 0x0000, 0x00ff, bulb);
			} else {
				lifx.lightsColour(0x0000, 0x0000, 0x3333, 0x0dac, 0x0000, bulb);
			}

			yield wait(500);
		}
	}).catch(function (err) {
		throw err;
	});
});




