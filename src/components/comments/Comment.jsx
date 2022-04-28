import './comments.css'
import { format } from "timeago.js";
import { useState } from "react";
import { useAppContext } from '../../context/AppContext';
import { Link } from "wouter";
import CommentEditor from './CommentEditor';
 
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Comment = ({ postId, comment, reloadComments }) => {
    const { walletAddress } = useAppContext();
    const [editComment, setEditComment] = useState(false);
    const [alert, setAlert] = useState(false);
    const [commentError, setCommentError] = useState(undefined);
  
    const toggleEditComment = () => {
        setEditComment(!editComment);
    }

    const handleAlert = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setAlert(false);
    };  
  

    const deleteComment = async () => {
      try {
        await window.point.contract.send({contract: 'PointSocial', method: 'deleteCommentForPost', params: [postId, comment.id]});
        await reloadComments();
      } catch (e) {
        console.error('Error deleting post: ', e.message);
        setCommentError('Error deleting post: ', e.message);
        setAlert(true);
      }  
    }

    const date = <span className="commentDate">{`(${format(comment.createdAt)})`}</span>;
    const editor = <CommentEditor commentId={comment.id} content={comment.contents} toggleEditComment={toggleEditComment} reloadComments={reloadComments}/>;
    
    return (
        (editComment)? editor :
        <div className="comment">
        { walletAddress === comment.from ?
          [ 
            <span className="commentFrom"><Link to={`/profile/${comment.from}`}>You</Link> commented: </span>, date, 
            <span className="commentEditText" onClick={toggleEditComment}>Edit</span>,
            <span className="commentDeleteText" onClick={deleteComment}>Delete</span>
          ]: 
          [<span className="commentUsername"><Link to={`/profile/${comment.from}`}>{comment.identity}</Link> commented:</span>, date] 
        }
        <br/>            
        <p className="commentText">{comment.contents}</p>
        <Snackbar open={alert} autoHideDuration={6000} onClose={handleAlert}>
        <Alert onClose={handleAlert} severity="error">
        { commentError }
        </Alert>
        </Snackbar>
        </div>
    )
}

export default Comment