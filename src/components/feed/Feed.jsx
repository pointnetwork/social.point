import "./feed.css";
import { useState, useEffect } from "react";
import useInView from 'react-cool-inview'
import { makeStyles } from '@material-ui/core/styles';

import unionWith from "lodash/unionWith";
import isEqual from "lodash/isEqual";

import { Box, Typography } from '@material-ui/core';

import HourglassEmptyOutlinedIcon from '@material-ui/icons/HourglassEmptyOutlined';
import CircularProgressWithIcon from '../generic/CircularProgressWithIcon';
import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';
import PostCard from "../post/PostCard";

const NUM_POSTS_PER_CALL = 10;

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0, 
    margin: 0, 
    marginTop: '10px',
    maxWidth: '900px'
  },
  observer: {
    display: 'flex',
/*    alignItems: 'center',*/
    justifyContent: 'center'
  },
  empty: {
    padding: theme.spacing(2, 2),
    display: "flex",
    flexDirection: "column",
/*    alignItems:"center",
    justifyContent: "center"*/        
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    display: "flex",
    height: "100%",
    minHeight: "50vh",
    flexDirection: "column",
    /*justifyContent: "center"*/        
  },
  separator: {
    marginTop: "20px",
    marginBottom: "20px",
  }
}));

const Feed = ({ account, setAlert, setUpperLoading, reload }) => {

  const {observe} = useInView({
    onEnter: async({observe,unobserve}) => {
      if(length === posts.length) return;
      unobserve();
      await getPosts();
      observe();
    }
  });
  const styles = useStyles();
  const [posts, setPosts] = useState([])
  const [length, setLength] = useState(0);
  const [loading, setLoading] = useState(false);

  // sorts accending (newest first)
  const compareByTimestamp = ( post1, post2 ) => {
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

  useEffect(()=>{
    reloadPosts();
  }, [reload]);

  const getPostsLength = async() => {
    try {
      setLoading(true);
      const { data } = account? 
      await window.point.contract.call({contract: 'PointSocial', method: 'getAllPostsByOwnerLength', params: [account]}) :
      await window.point.contract.call({contract: 'PointSocial', method: 'getAllPostsLength', params:[]});
      setLength(Number(data));
    }
    catch(error) {
      console.log(error.message);
      setAlert(error.message);
    }
    setLoading(false);
  }

  const fetchPosts = async (onlyNew = false) => {
    try {
      setLoading(true);
  
      const { data } = account
      ? 
        await window.point.contract.call(
          {contract: 'PointSocial',
           method: 'getPaginatedPostsByOwner', 
           params: [account,onlyNew?0:posts.length,NUM_POSTS_PER_CALL]}) 
      :
        await window.point.contract.call(
          {contract: 'PointSocial', 
           method: 'getPaginatedPosts', 
           params:[onlyNew?0:posts.length,NUM_POSTS_PER_CALL]})

      const newPosts = data.filter(r => (parseInt(r[4]) !== 0))
        .map(([id, from, contents, image, createdAt, likesCount, commentsCount]) => (
          {id, from, contents, image, createdAt: createdAt*1000, likesCount:parseInt(likesCount), commentsCount:parseInt(commentsCount)}
        )
      );

      return newPosts;
    } catch(error) {
      console.log(error.message);
      setAlert(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const getPosts = async (loadNew = false) => {
    try {
      console.log("getPosts");
      setLoading(true);
      const posts = await fetchPosts(loadNew);
      setPosts(prev => {
        const result = unionWith(prev, posts, isEqual);
        result.sort(compareByTimestamp);
        return result;
      });
    }
    catch(error) {
      console.log(error);
      setAlert(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const reloadPosts = async () => {
    await getPostsLength();
    await getPosts(true);
  }

  const deletePost = async (postId) => {
    await getPostsLength();
    setPosts((posts) => posts.filter(post => post.id !== postId));
  }

  return (
    <div className={styles.root}>
        <Box className={styles.container}>
          { !loading &&
              <> {
                  (length === 0)
                  ?
                    <Box color="text.disabled" display="flex" justifyContent="center" alignItems="center" height="100%" >
                        <div className={styles.empty}>
                            <InboxOutlinedIcon style={{ fontSize: 32 }} />
                            <Typography variant="caption">No posts yet. Be the first!</Typography>
                        </div>
                    </Box>
                  :
                    posts.filter(post => post.createdAt > 0).map((post) => (
                        <div key={post.id} className={styles.separator}>
                          <PostCard post={post} setUpperLoading={setLoading} setAlert={setAlert} canExpand={false} parentDeletePost={deletePost}/>
                        </div>
                    ))
              } </>
          }
          <div ref={observe} className={styles.observer}>
          {
            loading && 
            <CircularProgressWithIcon icon={<HourglassEmptyOutlinedIcon />} props={{color : "inherit"}} />
          }
          </div>
        </Box>
    </div>
  );

}
export default Feed
