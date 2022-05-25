
const POINT_TIMEOUT = 300000;
const MAX_TIMEOUT = 600000;

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
        const point = PointSDK._getPoint();
        const result = await Promise.race([
            point[component][call](args),
            new Promise((rs, rj) => setTimeout(()=>rj(new Error("Point SDK: Request Timeout")), (timeout || POINT_TIMEOUT)))
        ]);
        return (result.hasOwnProperty('data'))? result.data: result;
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

    static contractEvents = async (host, contractName, event, filter) => PointSDK._callSDKFunction('contract', 'events', {host, contractName, event, filter});

    static contractSubscribe = async (contract, event, options) => PointSDK._callSDKFunction('contract', 'subscribe', {contract, event, options});

}


export default PointSDK;