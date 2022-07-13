import point from "./PointSDK"

class UserManager {
    static getProfile = async (userAddress) => point.contractCall("PointSocial", "getProfile", [userAddress]);
    static setProfile = async (displayName, displayLocation, displayAbout, avatar, banner) => point.contractCall("PointSocial", "setProfile", [displayName, displayLocation, displayAbout, avatar, banner]);
    static isFollowing = async (owner, user) => point.contractCall("PSUser", "isFollowing", [owner, user]);
    static followUser = async (user) => point.contractCall("PSUser", "followUser", [user]);
    static unfollowUser = async (user) => point.contractCall("PSUser", "unfollowUser", [user]);
    static blockUser = async (user) => point.contractCall("PSUser", "blockUser", [user]);
    static unblockUser = async (user) => point.contractCall("PSUser", "unBlockUser", [user]);
    static isBlocked = async (owner, user) => point.contractCall("PSUser", "isBlocked", [owner, user]);
    static blockList = async () => point.contractCall("PSUser", "blockList", []);
    static followingList = async (user) => point.contractCall("PSUser", "followingList", [user]);
    static followersList = async (user) => point.contractCall("PSUser", "followersList", [user]);
    static followingCount = async (user) => point.contractCall("PSUser", "followingCount", [user]);
    static followersCount = async (user) => point.contractCall("PSUser", "followersCount", [user]);

}

export default UserManager
