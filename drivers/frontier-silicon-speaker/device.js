'use strict';

const Homey = require('homey');
const request = require('request-promise-native');
const xml2js = require('xml2js');

/*
 * TODO:
 * - on/off
 * - mode select
 * - radio preselect
 * - pin from settings
 * - sync state (on/off, volume) from device (GET)
 * - rediscover is ip changes?
 */
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
        // this.registerCapabilityListener('mode_select', this.onCapabilityModeSelect.bind(this))

        let selectPreset = new Homey.FlowCardAction('preset_select');
        selectPreset.register().registerRunListener(( args, state ) => {
            // let isStopped = rain.stop(); // true or false
            return Promise.resolve( true );
        });

        let data = this.getData();
        this.ip = data.ip;
        this.pin = "1234";
        this.sessionid = null;

        this.getSessionId().then(id => {
            this.sessionid = id;
        }).catch(error => {
            this.log("Couldn't fetch session id", error);
        });
    }

    getSessionId() {
        return new Promise((resolve, reject) => {
            let sessionid;

            request({
                url: `http://${this.ip}/fsapi/CREATE_SESSION`,
                qs: { pin: this.pin}
            }).then(res => {
                this.log("Create session result", res);
                xml2js.parseString(res, (error, result) => {
                    if(error) {
                        this.log("Error parsing session id", error);
                        reject({"errro": "parse error", data: error});
                    }
                    this.log("parsed", result);
                    sessionid = result.fsapiResponse.sessionId[0];
                    this.log("Session id", sessionid);
                    this.sessionid = sessionid;
                    resolve(sessionid)
                });
            }).catch(error => {
                reject({error: "api error", data: error});
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

    invokeApi(operation, value, retry=true) {
        return new Promise((resolve, reject) => {
            let data = this.getData();
            let ip = data.ip;

            let url = `http://${ip}/fsapi/${operation}`;

            request({url: url, qs: {
                pin: this.pin,
                sid: this.sessionid,
                value: value
            }}).then(res => {
                resolve();
                this.log('CALL SUCCESS', res);
            }).catch(err => {
                if(err.statusCode == 404) {
                    if(retry) {
                        this.log("Posibly session problem, refreshing id");
                        return this.getSessionId().then(sessionid => {
                            return this.invokeApi(operation, value, false);                        
                        });
                    }
                    else {
                        this.log("Possibly session problem but not retrying");
                        return reject({"error": "Unknown API error", data: err});
                    }
                } else if (err.statusCode == 403) {
                    return reject({"error": "Incorrect PIN"})
                }
                this.log('CALL ERROR', err);
                return reject({"error": "Unknown API error", data: err});
            });
        });
    }

    onCapabilityVolumeSet( value, opts, callback ) {

        let level = value * 20;

        this.invokeApi("SET/netRemote.sys.audio.volume", level.toString())
        // ... set value to real device
        this.log("OnCapabilityVolumeSet", value, opts);

        return Promise.resolve();
    }
    onCapabilityOnoff( value, opts, callback ) {

        // ... set value to real device
        this.log("OnCapabilityOnoff", value, opts);
        this.invokeApi("SET/netRemote.sys.power", value? "1": "0");

        return Promise.resolve();
    }
    onCapabilityVolumeMute( value, opts, callback ) {

        // ... set value to real device
        this.log("OnCapabilityVolumeMute", value, opts);
        this.invokeApi("SET/netRemote.sys.audio.mute", value? "1": "0");

        return Promise.resolve();
    }
    onCapabilityModeSelect( value, opts, callback ) {

        // ... set value to real device
        this.log("OnCapabilityModeSelect", value, opts);
        // this.invokeApi("SET/netRemote.sys.audio.mute", value? "1": "0");

        return Promise.resolve();
    }

}

module.exports = MyDevice;