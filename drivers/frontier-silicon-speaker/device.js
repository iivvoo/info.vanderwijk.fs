'use strict';

const Homey = require('homey');

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
    }

    // this method is called when the Device is added
    onAdded() {
        this.log('device added');
    }

    // this method is called when the Device is deleted
    onDeleted() {
        this.log('device deleted');
    }

    onCapabilityVolumeSet( value, opts, callback ) {

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