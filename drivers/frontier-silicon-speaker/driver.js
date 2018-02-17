'use strict';

const Homey = require('homey');
const Client = require('node-ssdp').Client
const SSDP_URN = 'urn:schemas-frontier-silicon-com:undok:fsapi:1';


class MyDriver extends Homey.Driver {
    discover() {
        // we may need to reuse this in device.js to do a second lookup
        // based on the name. THis way we can track ip changes
        return new Promise((resolve, reject) => {
		    let client = new Client();
            let speakers = [];

    		client.on('response', (headers, status, data)  => {
                if(!headers.LOCATION && headers['SPEAKER-NAME']) {
                    return;
                }

                speakers.push({
                    // follow and parse LOCATION to get details xml stuff
                    // (dd.xml)
                    name: headers['SPEAKER-NAME'],
                    data: {
                        ip: data.address,
                    }
                });

    			this.log('blaat');
    			this.log(headers);
    			this.log(data);
            });
            let timer= setTimeout(() => {
                client.stop();
                resolve(speakers);
            }, 5000);
    		client.search(SSDP_URN);
    		// client.search('ssdp:all');
        })
    }

    onPairListDevices(data, callback) {
        this.discover().then(speakers => {
            this.log("Discovered speaker", speakers);
            callback(null, speakers);
        });
    }
}

module.exports = MyDriver;