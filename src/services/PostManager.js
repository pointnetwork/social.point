import point from "./PointSDK"

const EMPTY = '0x0000000000000000000000000000000000000000';

class PostManager {
    static getPost = async (postId) => point.contractCall("PointSocial", "getPostById", [postId]);
    static isFlaggedPost = async (postId) => point.contractCall("PointSocial", "postIsFlagged", [postId]);
    static addPost = async (contentId, imageId) =>
        point.contractCall("PointSocial", "addPost", [
            (contentId) ? contentId : EMPTY,
            (imageId) ? imageId : EMPTY
        ]);
    static deletePost = async (postId) => point.contractCall("PointSocial", "deletePost", [postId]);
    static editPost = async (postId, contentId, imageId) => {
        return point.contractCall("PointSocial", "editPost", [
            postId,
            (contentId) ? contentId : EMPTY,
            (imageId) ? imageId : EMPTY
        ]);
    }
    static flagPost = async (postId) => point.contractCall("PointSocial", "flagPost", [postId]);
    static addLikeToPost = async (postId) => point.contractSend("PointSocial", "addLikeToPost", [postId]);
    static addDislikeToPost = async (postId) => point.contractSend("PointSocial", "addDislikeToPost", [postId]);
    static getAllPostsByOwnerLength = async (account) => point.contractCall("PointSocial", "getAllPostsByOwnerLength", [account]);
    static getAllPostsLength = async () => point.contractCall("PointSocial", "getAllPostsLength", []);
    static getPaginatedPostsByOwner = async (account, length, amount) => point.contractCall("PointSocial", "getPaginatedPostsByOwner", [account, length, amount]);
    static getPaginatedPosts = async (length, amount) => point.contractCall("PointSocial", "getPaginatedPosts", [length, amount]);
    static checkLikeToPost = async (postId) => point.contractCall("PointSocial", "checkLikeToPost", [postId]);
}

export default PostManager