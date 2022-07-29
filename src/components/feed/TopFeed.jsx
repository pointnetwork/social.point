import "./feed.css";
import { useState, useEffect } from "react";
import { useAppContext } from '../../context/AppContext';
import useInView from 'react-cool-inview'
import { makeStyles } from '@material-ui/core/styles';

import unionWith from "lodash/unionWith";
import isEqual from "lodash/isEqual";
import orderBy from "lodash/orderBy";

import { Box, Button, Snackbar, SnackbarContent, Typography } from '@material-ui/core';

import HourglassEmptyOutlinedIcon from '@material-ui/icons/HourglassEmptyOutlined';
import CircularProgressWithIcon from '../generic/CircularProgressWithIcon';
import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';
import PostCard from "../post/PostCard";

import EventConstants from "../../events";
import PostManager from '../../services/PostManager';

const NUM_POSTS_PER_CALL = 20;

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0, 
    margin: 0, 
    marginTop: '10px',
    maxWidth: '900px'
  },
  observer: {
    display: 'flex',
    justifyContent: 'center'
  },
  empty: {
    padding: theme.spacing(2, 2),
    display: "flex",
    flexDirection: "column",
    alignItems:"center",
    justifyContent: "center"
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    display: "flex",
    height: "100%",
    minHeight: "50vh",
    flexDirection: "column",
  },
  separator: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },  
}));

const TopFeed = ({ setAlert, setUpperLoading, canPost=false }) => {
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
  const [reload, setReload] = useState(false);

  const { walletAddress, events } = useAppContext();

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
    reloadPosts();
  }, []);

  useEffect(() => {
    getEvents();
    return () => {
      events.listeners["PointSocial"]["StateChange"].removeListener("StateChange", handleEvents, { type: 'feed'});
      events.unsubscribe("PointSocial", "StateChange");
    };
  }, []);

  const getEvents = async() => {
    try {
      (await events.subscribe("PointSocial", "StateChange")).on("StateChange", handleEvents, { type: 'feed'});
    }
    catch(error) {
      console.log(error.message);
    }
  }

  const handleEvents = async(event) => {
    if (event) {
      if (event.component === EventConstants.Component.Feed) {
        switch(event.action) {
          case EventConstants.Action.Create:
              if (event.from.toString().toLowerCase() === walletAddress.toLowerCase()) {
                // Autoload own posts
                await reloadPosts();
              }
              else {
                setReload(true);
              }
          break;
          default:
          break;
        }
      }
      else if (event.component === EventConstants.Component.Post) {
        switch(event.action) {
          case EventConstants.Action.Delete:
            deletePost(event.id);
          break;
          default:
          break;
        }
      }
    }
  }

  const getPostsLength = async() => {
    try {
      setLoading(true);
      const data = await PostManager.getAllPostsLength();
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
      const lastId = Number(await PostManager.getLastPostId());
      const lastCurrentId = (posts.length > 0)? parseInt(posts[posts.length - 1].id) : lastId;
      const data = await PostManager.getPaginatedPosts(onlyNew?lastId:lastCurrentId,NUM_POSTS_PER_CALL,3);

      const newPosts = data.filter(r => (parseInt(r[4]) !== 0))
        .map(([id, from, contents, image, createdAt, likesCount, commentsCount, dislikesCount, liked, disliked, flagged]) => (
          {
            id,
            from,
            contents,
            image, 
            createdAt: createdAt*1000, 
            likesCount: parseInt(likesCount, 10), 
            dislikesCount: parseInt(dislikesCount, 10), 
            commentsCount: parseInt(commentsCount, 10),
            liked,
            disliked,
            flagged
          }
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
    setReload(false);
  }

  const deletePost = async (postId) => {
    await getPostsLength();
    setPosts((posts) => posts.filter(post => post.id !== postId));
  }

  return (
    <>
    <Snackbar open={reload}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <SnackbarContent 
          message={'New posts available!'}
          action={<><Button color="secondary" size="small" onClick={()=>{setReload(false)}}>Dismiss</Button><Button color="secondary" size="small" onClick={()=>{reloadPosts()}}>Reload</Button></>}
        />
    </Snackbar>
    <div className={styles.root}>
        <Box className={styles.container}>
          { 
            (!loading && posts.length === 0)?
              <Box color="text.disabled" 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    height="100%">
                  <div className={styles.empty}>
                      <InboxOutlinedIcon style={{ fontSize: 32 }} />
                      <Typography 
                        variant="caption">{`No posts yet.${ canPost? " Be the first!" : "" }`}
                      </Typography>
                  </div>
              </Box>
              :
              orderBy(posts.filter(post => post.createdAt > 0), ['likesCount'], ['desc'])
              .map((post) => (
                  <div key={post.id} className={styles.separator}>
                    <PostCard 
                      post={post}
                      setUpperLoading={setLoading} 
                      setAlert={setAlert} 
                      canExpand={false} />
                  </div>
              ))
          }
          <div ref={observe} className={styles.observer}>
          {
            loading && 
            <CircularProgressWithIcon icon={<HourglassEmptyOutlinedIcon />} props={{color : "inherit"}} />
          }
          </div>
        </Box>
    </div>
    </>
  );

}
export default TopFeed
