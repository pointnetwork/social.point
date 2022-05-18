import { useEffect, useState, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';

import CommentItem from './CommentItem';

import {Backdrop, 
        Box,
        CircularProgress,
        Divider, 
        List,
        Typography,
    } from '@material-ui/core';

import Skeleton from '@material-ui/lab/Skeleton';

import AllInboxOutlinedIcon from '@material-ui/icons/AllInboxOutlined';
import RichTextField from '../generic/RichTextField';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        position: "absolute",
        zIndex: theme.zIndex.drawer - 1,
        opacity: 0.9    
    },
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    inline: {
        display: 'inline',
    },
    empty: {
        padding: theme.spacing(2, 2),
        display: "flex",
        flexDirection: "column",
        alignItems:"center",
        justifyContent: "center"        
    },
    commentBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'        
    }
}));

const CommentList = ({postId, setUpperLoading, setAlert}) => {

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    const inputRef = useRef();

    const styles = useStyles();
    
    useEffect(() => {
        loadComments();
    }, []);

    // TODO: Set a progressive approach for comment loading // Maybe getting only the indices?
    const loadComments = async () => {
        try {
            setLoading(true);
            const {data: comments}  = await window.point.contract.call({contract: 'PointSocial', method: 'getAllCommentsForPost', params: [postId]});
            const filtered = comments.filter(r => (parseInt(r[3]) !== 0)).map(([id, from, contents, createdAt]) => ({id, from, contents, createdAt: createdAt*1000}));
            setComments(filtered);
            setLoading(false);
        }
        catch(error) {
            setAlert(error.message);
        }
    };

    const addComment = async () => {
        if (inputRef && inputRef.current && inputRef.current.value && inputRef.current.value.trim()) {
            try {
                const contents = inputRef.current.value.trim();
                setLoading(true);
                const {data: storageId} = await window.point.storage.putString({data: contents});
                const result = await window.point.contract.send({contract: 'PointSocial', method: 'addCommentToPost', params: [postId, storageId]});
                console.log(result);
                // TODO: Fetch only the latest posts using progressive loading
                await loadComments();
            }
            catch(error) {
                setAlert(error.message);
            }
            finally {
                setLoading(false);
            }
        }
    }

    const deleteComment = (commentId) => {
        setComments((comments) => comments.filter(comment => comment.id !== commentId));
    }

    return (
        <>
            <div className={styles.root}>
                <Backdrop className={styles.backdrop} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                {
                    !loading && 
                    <Box m={2} className={styles.commentBox}>
                        <RichTextField ref={inputRef} value="" placeholder="Add a comment..."/>
                            <IconButton aria-label="send" ml={3} onClick={addComment}>
                                <SendOutlinedIcon />
                            </IconButton>
                    </Box>
                }
                <Divider variant="middle"/>
                { !loading && <>
                    {
                        (comments.length === 0)
                        ? 
                        <Box color="text.disabled" display="flex" justifyContent="center" alignItems="center" height="100%" >
                            <div className={styles.empty}>
                                <AllInboxOutlinedIcon style={{ fontSize: 32 }} />
                                <Typography variant="caption">No comments yet. Be the first!</Typography>
                            </div>
                        </Box>
                        :
                        <List className={styles.root}>
                        {
                            comments
                                .filter(c => c.createdAt > 0)
                                .map((comment) => (
                                <>
                                    { loading? <Skeleton width="100%"/>: <CommentItem key={comment.id} postId={postId} comment={comment} parentDeleteComment={deleteComment} setUpperLoading={setLoading} setAlert={setAlert}/> }
                                    <Divider variant="middle"/>
                                </>))
                        }
                        </List>
                    }
                </>}
            </div>
        </>
    )
}

export default CommentList