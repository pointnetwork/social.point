import "./feed.css";
import { useState,useEffect } from "react";
import { useAppContext } from '../../context/AppContext';
import useInView from 'react-cool-inview'
import Post from "../post/Post";
import Share from "../share/Share";
import Identity from "../identity/Identity";
import LoadingSpinner from '../loading/LoadingSpinner';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Pagination from '@material-ui/lab/Pagination';

import { makeStyles } from '@material-ui/core/styles';

const EMPTY_TEXT = '0x0000000000000000000000000000000000000000000000000000000000000000';
const EMPTY_MEDIA = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NUM_POSTS_PER_CALL = 9;

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  pagination: {
    '& > *': {
      marginTop: theme.spacing(2),
      align: 'center', 
      alignItems: 'center',
      justifyContent: 'center' 
    },
  },
}));

const Feed = ({account}) => {

  const classes = useStyles();

  const [posts, setPosts] = useState([])
  const [numPosts, setNumPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(undefined);
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
     getPosts();
  }, []);

  useEffect(()=>{
    reloadPosts();
  },[page]);

  const getPostsLength = async() => {
    const response = account? 
      await window.point.contract.call({contract: 'PointSocial', method: 'getAllPostsByOwnerLength', params: [account]}) :
      await window.point.contract.call({contract: 'PointSocial', method: 'getAllPostsLength', params:[]});
    setNumPosts(Number(response.data));
  }

  const fetchPosts = async () => {
    try {

      const response = account
        ? await window.point.contract.call({contract: 'PointSocial', method: 'getPaginatedPostsByOwner', params: [account, ((page - 1) * NUM_POSTS_PER_CALL),NUM_POSTS_PER_CALL]}) :
        await window.point.contract.call({contract: 'PointSocial', method: 'getPaginatedPosts', params:[((page - 1) * NUM_POSTS_PER_CALL),NUM_POSTS_PER_CALL]})

      const _posts = response.data.filter(r => (r[4] !== "0")).map(([id, from, contents, image, createdAt, likesCount, commentsCount]) => (
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
    }
  }

  const getPosts = async () => {
    setLoading(true);
    const posts = await fetchPosts();
    posts.sort(compareByTimestamp)
    setPosts(posts);
    setLoading(false);
  }

  // function reloads the post by id and updates the likes count of the object in state
  const reloadPostLikesCount = async(id) => {
    let post = await window.point.contract.call({contract: 'PointSocial', method: 'getPostById', params: [id]});
    const updatedPosts = [...posts];
    const updatedLikesCount = post.data[5];
    updatedPosts.filter((post) => post.id === id)[0].likesCount = updatedLikesCount;
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

  const reloadPosts = async() => {
    setLoading(true);
    await new Promise((res, rej) => setTimeout(res, 1000));
    await getPostsLength();
    await getPosts();    
  }

  const changePage = (event, value) => {
    setPage(value);
  }

  return (
    <div className="feed">
      <div className="feedWrapper">
        {!account && <div><Identity /><Share reloadPosts={reloadPosts}/></div>}
        {(!loading && feedError) && <span className='error'>Error loading feed: {feedError.message}. Did you deploy the contract sucessfully?</span>}
        {(!loading && !feedError && posts.length === 0) && <span className='no-post-to-show'>No posts made yet!</span>}
        {posts.map((p) => (
          <Post key={p.id} post={p} reloadPostLikesCount={reloadPostLikesCount} reloadPostContent={reloadPostContent} reloadPosts={reloadPosts}/>
        ))}
      </div>
      {
        numPosts > 0 &&
        <div className={classes.pagination}>
          <Pagination count={Math.ceil(numPosts/NUM_POSTS_PER_CALL)} color="primary" size="large" onChange={changePage}/>
        </div>
      }
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
export default Feed
