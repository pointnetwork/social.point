import "./post.css";
import { useState } from "react";
import { useAppContext } from '../../context/AppContext';
import { format } from "timeago.js";
import { Link } from "wouter";
import likeImg from '../../assets/like.png';
import profileImg from '../../assets/profile-pic.jpg';
import Comments from '../comments/Comments'
import PostEditor from "./PostEditor";

export default function Post({ post, reloadPostLikesCount, reloadPostContent, reloadPosts }) {
  const EMPTY_MEDIA = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const [showComments, setShowComments] = useState(false);
  const [editPost, setEditPost] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const { walletAddress } = useAppContext();
  const [loadImgError, setLoadImgError] = useState(false);
  const [loadVideoError, setLoadVideoError] = useState(false);

  const toggleShowComments = () => {
    setShowComments(!showComments);
  }

  const toggleEditPost = () => {
    setEditPost(!editPost);
  }

  const deletePost = async () => {
    try {
      await window.point.contract.send({contract: 'PointSocial', method: 'deletePost', params: [post.id]});
      await reloadPosts();
    } catch (e) {
      console.error('Error deleting post: ', e.message);
    }
  }

  const addLikeToPost = async () => {
    try {
      await window.point.contract.send({contract: 'PointSocial', method: 'addLikeToPost', params: [post.id]});
      reloadPostLikesCount(post.id);
    } catch (e) {
      console.error('Error updating likes: ', e.message);
    }
  };

  const reloadPost = async (contents, image) => {
    toggleEditPost();
    try {
      reloadPostContent(post.id, contents, image);
    }
    catch(e) {
      console.error('Error updating the post', e.message);
    }
  }

  const onImgErrorHandler = (e) => {
    setLoadImgError(true);
  }

  const onVideoErrorHandler = (e) => {
    setLoadVideoError(true);
  }

  let mediaTag;
  if (!loadImgError){
    mediaTag = <img className="postImage" src={`/_storage/${post.image}`} onError={onImgErrorHandler} alt=""></img>;
  }else{
    if(!loadVideoError){
      mediaTag = <video className="postImage" controls><source src={`/_storage/${post.image}`} onError={onVideoErrorHandler}></source></video>;
    }else{
      mediaTag = '';
    }
  }
  
  const postedContent = <div><p className="postText">{post?.contents}</p></div>
  const postedMedia = post.image !== EMPTY_MEDIA && mediaTag
  const postEdit = (walletAddress === post.from) && <span className="postEditText" onClick={toggleEditPost}>Edit</span>
  const postDelete = (walletAddress === post.from) && <span className="postDeleteText" onClick={deletePost}>Delete</span>

  return (
    <div className="post" id={post.id}>
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${walletAddress}`}>
                <img
                    src={profileImg}
                    alt=""
                    className="topbarImg"
                />
            </Link>
            {walletAddress === post.from ? <span className="posted-id">You posted</span> : <span className="postUsername">{post.identity}</span>}
          </div>
          <div className="postTopRight">
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
        </div>
        <div className="postCenter">
          { 
            editPost?
            <PostEditor post={post} toggleEditPost={toggleEditPost} reloadPost={reloadPost}/>:
            [postedContent, postedMedia]
          }
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={likeImg}
              onClick={addLikeToPost}
              alt=""
            />
            <span className="postLikeCounter">{post.likesCount} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText" onClick={toggleShowComments}>{commentsCount} comments</span>
            { (parseInt(commentsCount) === 0) && postEdit }
            { (parseInt(commentsCount) === 0) && postDelete }
          </div>
        </div>
        <div className="comments">
          {showComments && <Comments postId={post.id} commentsCount={commentsCount} setCommentsCount={setCommentsCount} />}
        </div>
      </div>
    </div>
  );
}
