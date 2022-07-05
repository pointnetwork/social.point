import point from "./PointSDK"

const EMPTY = '0x0000000000000000000000000000000000000000';

class CommentManager {
    static getComment = async (commentId) => point.contractCall("PointSocial", "getCommentById", [commentId]);
    static getComments = async (postId) => point.contractCall("PointSocial", "getAllCommentsForPost", [postId]);
    static addComment = async (postId, storageId) =>
        point.contractCall(
            "PointSocial",
            "addCommentToPost",
            [postId, storageId.startsWith('0x') ? storageId : `0x${storageId}`]
        );
    static deleteComment = async (postId, commentId) => point.contractCall("PointSocial", "deleteCommentForPost", [postId, commentId]);
    static editComment = async (commentId, contentId) =>
        point.contractCall(
            "PointSocial",
            "editCommentForPost",
            [commentId, contentId.startsWith('0x') ? contentId : `0x${contentId}`]);
}

export default CommentManager