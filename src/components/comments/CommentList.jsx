import { useEffect, useState } from "react";
import { useAppContext } from '../../context/AppContext';
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
    }
}));

const CommentList = ({postId, setUpperLoading, setAlert}) => {

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    const styles = useStyles();
    
    useEffect(() => {
        loadComments();
    }, []);

    // TODO: Set a progressive comment loading // Maybe getting only the indices?
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

    const deleteComment = (commentId) => {
        setComments((comments) => comments.filter(comment => comment.id !== commentId));
    }

    return (
        <>
            <div className={styles.root}>
                <Backdrop className={styles.backdrop} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
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