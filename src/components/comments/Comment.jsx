import './comments.css'
import { format } from "timeago.js";
import { useState } from "react";
import { useAppContext } from '../../context/AppContext';
import CommentEditor from './CommentEditor';
 
const Comment = ({ comment, renderCommentContentImmediate }) => {
    const { walletAddress } = useAppContext();
    const [editComment, setEditComment] = useState(false);

    const toggleEditComment = () => {
        setEditComment(!editComment);
    }

    const date = <span className="commentDate">{`(${format(comment.createdAt)})`}</span>;
    const editor = <CommentEditor commentId={comment.id} content={comment.contents} toggleEditComment={toggleEditComment} renderCommentContentImmediate={renderCommentContentImmediate}/>;

    return (
        (editComment)? editor :
        <div className="comment">
        { walletAddress === comment.from ? 
          [<span className="commentFrom">You commented: </span>, date, <span className="commentEditText" onClick={toggleEditComment}>Edit</span>] : 
          [<span className="commentUsername">{comment.identity} commented</span>, date] 
        }
        <br/>            
        <p className="commentText">{comment.contents}</p>
      </div>
    )
}

export default Comment