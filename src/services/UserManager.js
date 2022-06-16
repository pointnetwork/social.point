import point from "./PointSDK"

class UserManager {
    static getProfile = async (userAddress) => point.contractCall("PointSocial", "getProfile", [userAddress]);
    static setProfile = async (displayName, displayLocation, displayAbout, avatar, banner) => point.contractCall("PointSocial", "setProfile", [displayName, displayLocation, displayAbout, avatar, banner]);
}

export default UserManager
