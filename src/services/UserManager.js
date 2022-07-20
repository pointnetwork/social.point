import point from "./PointSDK"

class UserManager {
    static getProfile = async (userAddress) => point.contractCall("PointSocial", "getProfile", [userAddress]);
    static setProfile = async (displayName, displayLocation, displayAbout, avatar, banner) => point.contractCall("PointSocial", "setProfile", [displayName, displayLocation, displayAbout, avatar, banner]);
    static isFollowing = async (owner, user) => point.contractCall("PointSocial", "isFollowing", [owner, user]);
    static followUser = async (user) => point.contractCall("PointSocial", "followUser", [user]);
    static unfollowUser = async (user) => point.contractCall("PointSocial", "unfollowUser", [user]);
    static blockUser = async (user) => point.contractCall("PointSocial", "blockUser", [user]);
    static unblockUser = async (user) => point.contractCall("PointSocial", "unBlockUser", [user]);
    static isBlocked = async (owner, user) => point.contractCall("PointSocial", "isBlocked", [owner, user]);
    static blockList = async () => point.contractCall("PointSocial", "blockList", []);
    static followingList = async (user) => point.contractCall("PointSocial", "followingList", [user]);
    static followersList = async (user) => point.contractCall("PointSocial", "followersList", [user]);
    static followingCount = async (user) => point.contractCall("PointSocial", "followingCount", [user]);
    static followersCount = async (user) => point.contractCall("PointSocial", "followersCount", [user]);

}

export default UserManager
