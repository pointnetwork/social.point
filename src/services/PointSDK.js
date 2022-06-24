
const POINT_TIMEOUT = 30 * 1000;
const MAX_TIMEOUT = 600 * 1000;
const DEBUG = true;
const DISPLAY_ERRORS = true;

class PointSDK {

    static _getPoint() {
        if (window && window.point) {
            return window.point;
        }
        else {
            throw new Error("Point SDK not available");
        }
    }

    static async _callSDKFunction(component, call, args = {}, timeout) {
        const callId = Date.now();
        try {
            const point = PointSDK._getPoint();
            if (DEBUG) console.info(`Execution: ${callId}`);
            const result = await Promise.race([
                point[component][call](args),
                new Promise((rs, rj) => setTimeout(()=>rj(new Error("PointSDK: Request Timeout")), (timeout || POINT_TIMEOUT)))
            ]);
            if (DEBUG) console.info(`${callId}: Call: ${component} ${call} ${JSON.stringify(args)} | Result ${JSON.stringify(result)}`);
            return (result.hasOwnProperty('data'))? result.data: result;
        }
        catch(error) {
            if (DEBUG || DISPLAY_ERRORS) console.error(`PointSDK invocation failed: ${error.message} ${callId}: Call: ${component} ${call} ${JSON.stringify(args)}`);
            throw error;
        }
    }

    /************** BASIC FUNCTIONS **************/

    static getVersion() {
        const point = PointSDK._getPoint();
        return point.version;
    }

    static async ping() {
        const point = PointSDK._getPoint();
        const {data} = await point.ping();
        return data;
    }

    /************** WALLET FUNCTIONS **************/

    static getWalletAddress = async () => PointSDK._callSDKFunction('wallet', 'address'); // OK

    static getWalletHash = async () => PointSDK._callSDKFunction('wallet', 'hash');

    static getWalletPublicKey = async () => PointSDK._callSDKFunction('wallet', 'publicKey');

    static getWalletBalance = async () => PointSDK._callSDKFunction('wallet', 'balance');

    static encryptData = async (publicKey, encryptData, args) => PointSDK._callSDKFunction('wallet', 'encryptData', { publicKey, encryptData, args });

    static decryptData = async (decryptData, args) => PointSDK._callSDKFunction('wallet', 'encryptData', { decryptData, args });

    /************** IDENTITY FUNCTIONS **************/

    static getPublicKeyByIdentity = async (identity, args) => PointSDK._callSDKFunction('identity', 'publicKeyByIdentity', {identity, args});

    static identityToOwner = async (identity) => PointSDK._callSDKFunction('identity', 'identityToOwner', {identity}); // OK

    static ownerToIdentity = async (owner) => PointSDK._callSDKFunction('identity', 'ownerToIdentity', {owner});

    /************** STORAGE FUNCTIONS **************/

    static postFile = async (file) => PointSDK._callSDKFunction('storage', 'postFile', file, MAX_TIMEOUT);

    static getString = async (id, args={}) => PointSDK._callSDKFunction('storage', 'getString', {id, ...args}, MAX_TIMEOUT);

    static putString = async (data) => PointSDK._callSDKFunction('storage', 'putString', {data}, MAX_TIMEOUT);

    /************** CONTRACT FUNCTIONS **************/

    static contractLoad = async (contract, args) => PointSDK._callSDKFunction('contract', 'load', {contract, args});

    static contractSend = async (contract, method, params, value) => PointSDK._callSDKFunction('contract', 'send', {contract, method, params, value});

    static contractCall = async (contract, method, params) => PointSDK._callSDKFunction('contract', 'call', {contract, method, params});

    static contractEvents = async (host = window.location.hostname, contract, event, filter = {}) => PointSDK._callSDKFunction('contract', 'events', {host, contract, event, filter});

    static contractSubscribe = async (contract, event, options) => PointSDK._callSDKFunction('contract', 'subscribe', {contract, event, options});

}


export default PointSDK;