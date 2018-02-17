'use strict';

const Homey = require('homey');
const request = require('request-promise-native');
const xml2js = require('xml2js');

class MyDevice extends Homey.Device {

    // this method is called when the Device is inited
    onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());
        this.log('data:', this.getData());

        // register a capability listener
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
        this.registerCapabilityListener('volume_set', this.onCapabilityVolumeSet.bind(this))
        this.registerCapabilityListener('volume_mute', this.onCapabilityVolumeMute.bind(this))

        let data = this.getData();
        let ip = data.ip;
        this.pin = "1234";

        request({
            url: `http://${ip}/fsapi/CREATE_SESSION`,
            qs: { pin: this.pin}
        }).then(res => {
            this.log("Create session result", res);
            xml2js.parseString(res, (error, result) => {
                if(error) {
                    this.log("Error parsing session id", error);
                    // reject
                }
                this.log("parsed", result);
                this.sessionid = result.fsapiResponse.sessionId[0];
                this.log("Session id", this.sessionid);
            });
        });
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    invokeApi(operation, value) {
        let data = this.getData();
        let ip = data.ip;

        let url = `http://${ip}/fsapi/${operation}`;

        request({url: url, qs: {
            pin: this.pin,
            sid: this.sessionid,
            value: value
        }});

    }
    onCapabilityVolumeSet( value, opts, callback ) {

        let level = value * 20;

        this.invokeApi("SET/netRemote.sys.audio.volume", level.toString())
        // ... set value to real device
        this.log("OnCapabilityVolumeSet", value, opts);

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        this.log("OnCapabilityOnoff", value, opts);

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }
    onCapabilityVolumeMute( value, opts, callback ) {

        // ... set value to real device
        this.log("OnCapabilityVolumeMute", value, opts);

        // Then, emit a callback ( err, result )
        callback( null );

        // or, return a Promise
        return Promise.reject( new Error('Switching the device failed!') );
    }

}

module.exports = MyDevice;