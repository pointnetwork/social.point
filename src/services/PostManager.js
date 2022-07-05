import point from "./PointSDK"

const EMPTY = '0x0000000000000000000000000000000000000000';

class PostManager {
    static getPost = async (postId) => point.contractCall("PointSocial", "getPostById", [postId]);
    static addPost = async (storageId, imageId) =>
        point.contractCall("PointSocial", "addPost", [
            (storageId ? storageId.startsWith('0x') ? storageId : `0x${storageId}` : EMPTY),
            (imageId ? imageId.startsWith('0x') ? imageId : `0x${imageId}` : EMPTY)
        ]);
    static deletePost = async (postId) => point.contractCall("PointSocial", "deletePost", [postId]);
    static editPost = async (postId, contentId, imageId) =>
        point.contractCall("PointSocial", "editPost", [
            postId,
            (contentId ? contentId.startsWith('0x') ? contentId : `0x${contentId}` : EMPTY)
            (imageId ? imageId.startsWith('0x') ? imageId : `0x${imageId}` : EMPTY)
        ]);
    static addLikeToPost = async (postId) => point.contractSend("PointSocial", "addLikeToPost", [postId]);
    static getAllPostsByOwnerLength = async (account) => point.contractCall("PointSocial", "getAllPostsByOwnerLength", [account]);
    static getAllPostsLength = async () => point.contractCall("PointSocial", "getAllPostsLength", []);
    static getPaginatedPostsByOwner = async (account, length, amount) => point.contractCall("PointSocial", "getPaginatedPostsByOwner", [account, length, amount]);
    static getPaginatedPosts = async (length, amount) => point.contractCall("PointSocial", "getPaginatedPosts", [length, amount]);
    static checkLikeToPost = async (postId) => point.contractCall("PointSocial", "checkLikeToPost", [postId]);
}

export default PostManager