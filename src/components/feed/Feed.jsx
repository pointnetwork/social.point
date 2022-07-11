import './feed.css';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import useInView from 'react-cool-inview';
import { makeStyles } from '@material-ui/core/styles';

import unionWith from 'lodash/unionWith';
import isEqual from 'lodash/isEqual';

import { Box, Button, Snackbar, SnackbarContent, Typography } from '@material-ui/core';

import HourglassEmptyOutlinedIcon from '@material-ui/icons/HourglassEmptyOutlined';
import CircularProgressWithIcon from '../generic/CircularProgressWithIcon';
import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';
import PostCard from '../post/PostCard';

import EventConstants from '../../events';
import PostManager from '../../services/PostManager';

import getPostData from '../../mappers/Post';

const NUM_POSTS_PER_PAGE = 5;
const NUM_POSTS_PER_CALL = 100;

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    margin: 0,
    marginTop: '10px',
    maxWidth: '900px',
  },
  observer: {
    display: 'flex',
    justifyContent: 'center',
  },
  empty: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    display: 'flex',
    height: '100%',
    minHeight: '50vh',
    flexDirection: 'column',
  },
  separator: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

const Feed = ({ account, setAlert, setUpperLoading, canPost = false }) => {
  const { observe } = useInView({
    onEnter: async ({ observe, unobserve }) => {
      if (length === posts.length) return;
      unobserve();
      await getPosts();
      observe();
    },
  });
  const styles = useStyles();
  const [posts, setPosts] = useState([]);
  const [viewedPostIds, setViewedPostIds] = useState([]);
  const [length, setLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  const { walletAddress, events } = useAppContext();

  useEffect(() => {
    reloadPosts();
  }, []);

  useEffect(() => {
    getEvents();
    return () => {
      events.listeners['PointSocial']['StateChange'].removeListener('StateChange', handleEvents, {
        type: 'feed',
      });
      events.unsubscribe('PointSocial', 'StateChange');
    };
  }, []);

  const getEvents = async () => {
    try {
      (await events.subscribe('PointSocial', 'StateChange')).on('StateChange', handleEvents, {
        type: 'feed',
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEvents = async (event) => {
    if (event) {
      if (event.component === EventConstants.Component.Feed) {
        switch (event.action) {
          case EventConstants.Action.Create:
            if (event.from.toString().toLowerCase() === walletAddress.toLowerCase()) {
              // Autoload own posts
              await reloadPosts(true);
            } else {
              setReload(true);
            }
            break;
          default:
            break;
        }
      } else if (event.component === EventConstants.Component.Post) {
        switch (event.action) {
          case EventConstants.Action.Delete:
            deletePost(event.id);
            break;
          default:
            break;
        }
      }
    }
  };

  const getPostsLength = async () => {
    try {
      setLoading(true);
      const data = await (account
        ? PostManager.getAllPostsByOwnerLength(account)
        : PostManager.getAllPostsLength());

      setLength(Number(data));
    } catch (error) {
      console.log(error.message);
      setAlert(error.message);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const data = await (account
        ? PostManager.getPaginatedPostsByOwner(account, NUM_POSTS_PER_CALL, viewedPostIds)
        : PostManager.getPaginatedPosts(NUM_POSTS_PER_CALL, viewedPostIds));

      const newPosts = data.map(getPostData);

      return newPosts
        .sort(({ weight: w1 }, { weight: w2 }) => w2 - w1)
        .slice(0, NUM_POSTS_PER_PAGE);
    } catch (error) {
      console.log(error.message);
      setAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPosts = async (refresh = false) => {
    try {
      setLoading(true);
      const posts = await fetchPosts();

      // save posts
      setPosts((prev) => {
        if (refresh) {
          return posts;
        }
        const result = unionWith(prev, posts, isEqual);
        return result;
      });

      // save viewed posts
      setViewedPostIds((prev) => {
        posts.forEach(({ id }) => {
          if (!prev.includes(id)) {
            prev.push(id);
          }
        });
        return prev;
      });
    } catch (error) {
      console.log(error);
      setAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadPosts = async (refresh = false) => {
    await Promise.all([getPostsLength(), getPosts(refresh)]);
    setReload(false);
  };

  const deletePost = async (postId) => {
    await getPostsLength();
    setPosts((posts) => posts.filter((post) => post.id !== postId));
  };

  return (
    <>
      <Snackbar open={reload} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <SnackbarContent
          message={'New posts available!'}
          action={
            <>
              <Button
                color="secondary"
                size="small"
                onClick={() => {
                  setReload(false);
                }}
              >
                Dismiss
              </Button>
              <Button
                color="secondary"
                size="small"
                onClick={() => {
                  reloadPosts();
                }}
              >
                Reload
              </Button>
            </>
          }
        />
      </Snackbar>
      <div className={styles.root}>
        <Box className={styles.container}>
          {length === 0 ? (
            <Box
              color="text.disabled"
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <div className={styles.empty}>
                <InboxOutlinedIcon style={{ fontSize: 32 }} />
                <Typography variant="caption">
                  {`No posts yet.${canPost ? ' Be the first!' : ''}`}
                </Typography>
              </div>
            </Box>
          ) : (
            posts
              .filter((post) => post.createdAt > 0)
              .map((post) => (
                <div key={post.id} className={styles.separator}>
                  <PostCard
                    post={post}
                    setUpperLoading={setLoading}
                    setAlert={setAlert}
                    canExpand={false}
                  />
                </div>
              ))
          )}
          <div ref={observe} className={styles.observer}>
            {loading && (
              <CircularProgressWithIcon
                icon={<HourglassEmptyOutlinedIcon />}
                props={{ color: 'inherit' }}
              />
            )}
          </div>
        </Box>
      </div>
    </>
  );
};
export default Feed;
