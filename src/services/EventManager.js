import point from "./PointSDK"

import EventEmitter from "eventemitter3";

const POLL_INTERVAL = 100;

class ContractEvents extends EventEmitter {

    constructor(event) {
        super();
        this.event = event;
        try {
            this.interval = setInterval(async () => {
                const ev = await this.event();
                if (ev) {
                    this.emit(ev.event, ev.returnValues);
                }
            }, POLL_INTERVAL);
        }
        catch(error) {
            console.warn(error.message);
        }
    }    

    dispose = () => {
        try {
            clearInterval(this.interval);
            if (this.event) {
                this.event.unsubscribe();
            }
        }
        catch(error) {
            console.warn(error.message);
        }
    };
}

class EventManager {

    constructor() {
        this.listeners = {};
    }

    async subscribe(contract, event) {

        if (!this.listeners[contract]) {
            this.listeners[contract] = {};
        }

        if (!this.listeners[contract][event]) {
            this.listeners[contract][event] = 
                new ContractEvents(await point.contractSubscribe(contract, event));
        }
        return this.listeners[contract][event];
    }

    async unsubscribe(contract, event) {
        if (!this.listeners[contract][event]) {
            this.listeners[contract][event].dispose();
        }
    }

}

export default EventManager
