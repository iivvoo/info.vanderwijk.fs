'use strict';

const Homey = require('homey');
const SsdpClient = require('node-ssdp').Client
const HomeyAppUpload = require('homey-app-upload-lib');

class MyApp extends Homey.App {
	
	onInit() {
		HomeyAppUpload(this.manifest);
		this.log('MyApp is running...');
	}
}

module.exports = MyApp;