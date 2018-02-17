'use strict';

const Homey = require('homey');
const SsdpClient = require('node-ssdp').Client


class MyApp extends Homey.App {
	
	onInit() {
		
		this.log('MyApp is running...');
		
	}
	
}

module.exports = MyApp;