import "./feed.css";
import { useState,useEffect } from "react";
import { useAppContext } from '../../context/AppContext';
import useInView from 'react-cool-inview'
import Post from "../post/Post";
import Share from "../share/Share";
import Identity from "../identity/Identity";

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import unionWith from "lodash/unionWith";
import isEqual from "lodash/isEqual";

import { makeStyles } from '@material-ui/core/styles';

const EMPTY_TEXT = '0x0000000000000000000000000000000000000000000000000000000000000000';
const EMPTY_MEDIA = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NUM_POSTS_PER_CALL = 20;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },  
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Feed = ({account}) => {

  const {observe} = useInView({
    onEnter: async({observe,unobserve}) => {
      if(numPosts === posts.length) return;
      unobserve();
      await getPosts();
      observe();
    }
  });
  const classes = useStyles();
  const [posts, setPosts] = useState([])
  const [numPosts, setNumPosts] = useState();
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [feedError, setFeedError] = useState(undefined);
  const [alert, setAlert] = useState(false);
  
  const { walletAddress } = useAppContext();
  
  const compareByTimestamp = ( post1, post2 ) => {
    // sorts accending (newest first)
    if ( post1.createdAt < post2.createdAt ){
      return 1;
    }
    if ( post1.createdAt > post2.createdAt ){
      return -1;
    }
    return 0;
  }

  useEffect(()=>{
    console.log('@@@@@@@@@@posts',posts)
    console.log('@@@@@@@@@@account',account)
  },[posts,account]);

  useEffect(() => {
     getPostsLength();
  }, []);

  const handleAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert(false);
  };

  const getPostsLength = async() => {
    const response = account? 
      await window.point.contract.call({contract: 'PointSocial', method: 'getAllPostsByOwnerLength', params: [account]}) :
      await window.point.contract.call({contract: 'PointSocial', method: 'getAllPostsLength', params:[]});
      setNumPosts(Number(response.data));
  }

  const fetchPosts = async (onlyNew = false) => {
    try {
      const response = account
        ? await window.point.contract.call({contract: 'PointSocial', method: 'getPaginatedPostsByOwner', params: [account,onlyNew?0:posts.length,NUM_POSTS_PER_CALL]}) :
        await window.point.contract.call({contract: 'PointSocial', method: 'getPaginatedPosts', params:[onlyNew?0:posts.length,NUM_POSTS_PER_CALL]})
      const _posts = response.data.filter(r => (parseInt(r[4]) !== 0)).map(([id, from, contents, image, createdAt, likesCount, commentsCount]) => (
          {id, from, contents, image, createdAt: createdAt*1000, likesCount, commentsCount}
        )
      )

      const postsContent = await Promise.all(_posts.map(async (post) => {
          try {
              const {data: contents} = (post.contents === EMPTY_TEXT)? '' : await window.point.storage.getString({ id: post.contents, encoding: 'utf-8' });
              const {data: {identity}} = await window.point.identity.ownerToIdentity({owner: post.from});
              post.identity = identity;
              post.contents = contents;
          } catch (e) {
              console.error('Failed to load post ' + JSON.stringify(post));
              post.contents = 'Failed to load post';
          }
        return post;
      }))

      return postsContent;
    } catch(e) {
      console.error('Error loading feed: ', e.message);
      setLoading(false);
      setFeedError(e);
      setAlert(true);
    }
  }

  const getPosts = async (loadNew = false) => {
    setLoading(true);
    const posts = await fetchPosts(loadNew);
    setPosts(prev => {
      const result = unionWith(prev, posts, isEqual);
      result.sort(compareByTimestamp);
      return result;
    });
    setLoading(false);
  }

  // function reloads the post by id and updates the likes count of the object in state
  const reloadPostCounts = async(id) => {
    let post = await window.point.contract.call({contract: 'PointSocial', method: 'getPostById', params: [id]});
    const updatedPosts = [...posts];
    updatedPosts.filter((post) => post.id === id)[0].likesCount = post.data[5];
    updatedPosts.filter((post) => post.id === id)[0].commentsCount = post.data[6];
    setPosts(updatedPosts);
  }

  //TODO: temporary fix, it should wait until transaction is confirmed and read from smartcontract
  const reloadPostContent = async(id, contents, image) => {
    const updatedPosts = [...posts];
    updatedPosts.filter((post) => post.id === id)[0].contents = contents;
    if (image !== EMPTY_MEDIA) {
      updatedPosts.filter((post) => post.id === id)[0].image = image;
    }
    setPosts(updatedPosts);
  }

  const reloadPosts = async () => {
    setPageLoading(true);
    await getPosts(true);
    setPageLoading(false);
  }

  const renderDeletedPostImmediate = async (postId) => {
    setLoading(true);
    const updatedPosts = [...posts];
    updatedPosts.filter((post) => post.id === postId)[0].createdAt = 0;
    setLoading(false);
  }

  return (
    <div className="feed">
      <div className="feedWrapper">
        {!account && <div><Identity /><Share reloadPosts={reloadPosts}/></div>}
        {(!loading && !feedError && posts.length === 0) && <span className='no-post-to-show'>No posts made yet!</span>}
        {posts.filter(p => p.createdAt > 0).map((p) => (
          <Post 
            key={p.id}
            post={p}
            reloadPostCounts={reloadPostCounts}
            reloadPostContent={reloadPostContent}
            renderDeletedPostImmediate={renderDeletedPostImmediate}/>
        ))}
        <div ref={observe} className={classes.root}>
          {loading &&<CircularProgress/>}
        </div>
      </div>
      <Backdrop className={classes.backdrop} open={pageLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar open={alert} autoHideDuration={6000} onClose={handleAlert}>
        <Alert onClose={handleAlert} severity="error">
          Error loading feed: {feedError && feedError.message}. Did you deploy the contract sucessfully?
        </Alert>
      </Snackbar>
    </div>
  );
}
export default Feed
