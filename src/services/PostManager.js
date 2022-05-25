import point from "./PointSDK"

const EMPTY = '0x0000000000000000000000000000000000000000';

class PostManager {
    static getPost = async (postId) => point.contractCall("PointSocial", "getPostById", [postId]);
    static addPost = async (storageId, imageId) => point.contractSend("PointSocial", "addPost", [(storageId || EMPTY), (imageId || EMPTY)]);
    static deletePost = async (postId) => point.contractSend("PointSocial", "deletePost", [postId]);
    static editPost = async (postId, contentId, imageId) => point.contractSend("PointSocial", "editPost", [postId, contentId, imageId]);
    static addLikeToPost = async (postId) => point.contractSend("PointSocial", "addLikeToPost", [postId]);
    static getAllPostsByOwnerLength = async (account) => point.contractCall("PointSocial", "getAllPostsByOwnerLength", [account]);
    static getAllPostsLength = async () => point.contractCall("PointSocial", "getAllPostsLength", []);
    static getPaginatedPostsByOwner = async (account, length, amount) => point.contractCall("PointSocial", "getPaginatedPostsByOwner", [account, length, amount]);
    static getPaginatedPosts = async (length, amount) => point.contractCall("PointSocial", "getPaginatedPosts", [length, amount]);
    static checkLikeToPost = async (postId) => point.contractCall("PointSocial", "checkLikeToPost", [postId]);
}

export default PostManager
