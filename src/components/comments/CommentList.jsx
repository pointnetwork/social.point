import { useEffect, useState, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../context/AppContext';

import CommentItem from './CommentItem';
import CircularProgressWithIcon from "../../components/generic/CircularProgressWithIcon";

import {Box,
        Divider, 
        List,
        Typography,
    } from '@material-ui/core';

import Skeleton from '@material-ui/lab/Skeleton';

import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';
import RichTextField from '../generic/RichTextField';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import IconButton from '@material-ui/core/IconButton';
import SmsOutlinedIcon from '@material-ui/icons/SmsOutlined';

/*
import { VariableSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { TramRounded } from "@material-ui/icons";*/

import point from "../../services/PointSDK";
import CommentManager from "../../services/CommentManager";
import EventConstants from "../../events";


const useStyles = makeStyles((theme) => ({
    backdrop: {
        position: "absolute",
        zIndex: theme.zIndex.drawer - 1,
        opacity: 0.9    
    },
    root: {
        width: '100%',
        height: '100%',
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
        justifyContent: "center",
        marginBottom: theme.spacing(6)        
    },
    commentBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'        
    },
    virtual: {
        width: '100%',
        height: 400,
        backgroundColor: theme.palette.background.paper,        
    },
    list: {
        minHeight: '50vh'        
    }
}));

const CommentList = ({postId, setUpperLoading, setAlert}) => {

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const {events, processing, setProcessing} = useAppContext();

    const inputRef = useRef();

    const styles = useStyles();
    
    useEffect(() => {
        loadComments();
    }, []);

    useEffect(() => {
        if (events.listeners["PointSocial"] &&
            events.listeners["PointSocial"]["StateChange"]) {
                events.listeners["PointSocial"]["StateChange"]
                    .on("StateChange", handleEvents, { type: "comments",  id: postId });
        }
        return () => {
            if (events.listeners["PointSocial"] &&
            events.listeners["PointSocial"]["StateChange"]) {
                events.listeners["PointSocial"]["StateChange"]
                    .removeListener("StateChange", handleEvents, { type: "comments",  id: postId });
            }
        }
    }, []);

    const handleEvents = async(event) => {
        if (event && 
            (event.component === EventConstants.Component.Post) && 
            (event.id === postId)) {
            switch(event.action) {
                case EventConstants.Action.Comment:
                    await loadComments();
                break; 
                default:
                break;
            }
        }
    }

    // TODO: Set a progressive approach for comment loading // Maybe getting only the indices?
    const loadComments = async () => {
        try {
            setLoading(true);
            const comments = await CommentManager.getComments(postId);
            const filtered = comments.filter(r => (parseInt(r[3]) !== 0)).map(([id, from, contents, createdAt]) => ({id, from, contents, createdAt: createdAt*1000}));
            setComments(filtered);
        }
        catch(error) {
            setAlert(error.message);
        }
        finally {
            setLoading(false);
        }
    };

    const addComment = async () => {
        if (inputRef && inputRef.current && inputRef.current.value && inputRef.current.value.trim()) {
            try {
                const contents = inputRef.current.value.trim();
                setProcessing(true);
                setLoading(true);
                const storageId = await point.putString(contents);
                const result = await CommentManager.addComment(postId, storageId);
                console.log(result);
                setAlert("Your comment was successfully shared!|success");
                // TODO: Fetch only the latest comments using progressive loading
                //await loadComments();
            }
            catch(error) {
                setAlert(error.message);
            }
            finally {
                setLoading(false);
                setProcessing(false);
            }
        }
    }
    /*
    const deleteComment = async (commentId) => {
        setComments((comments) => comments.filter(comment => comment.id !== commentId));
    }
    */  

    /*
    //TODO: get this value from the component
    const getItemSize = index => 75

    // TODO: Implement the loading
    const isItemLoaded = index => true;
    const loadMoreItems = (startIndex, stopIndex) => {};

    const renderRow = ({ index, style }) => {
        return (
            <CommentItem key={comments[index].id.toString()} postId={postId} comment={comments[index]} parentDeleteComment={deleteComment} setAlert={setAlert} preloaded={true} preloadedData={{ name: "pepe", contents:"this is pepe"}} style={style}/>            
        );
    }*/
      
    return (
        <div className={styles.root}>
            {
                loading
                ?
                    <Box m={2} className={styles.commentBox}>
                        <CircularProgressWithIcon icon={<SmsOutlinedIcon/>} props={{color : 'inherit'}} />
                    </Box>
                :
                    <Box m={2} className={styles.commentBox}>
                        <RichTextField ref={inputRef} value="" placeholder="Add a comment..."/>
                            <IconButton aria-label="send" ml={3} onClick={addComment} disabled={processing}>
                                <SendOutlinedIcon />
                            </IconButton>
                    </Box>
            }
            <Divider variant="middle"/>
            { !loading &&
                <> {
                    (comments.length === 0)
                    ?
                    <Box color="text.disabled" display="flex" justifyContent="center" alignItems="center" height="100%" >
                        <div className={styles.empty}>
                            <InboxOutlinedIcon style={{ fontSize: 32 }} />
                            <Typography variant="caption">No comments yet. Be the first!</Typography>
                        </div>
                    </Box>
                    :
                    <List className={styles.root}>
                        {
                            comments
                                .filter(c => c.createdAt > 0)
                                .map((comment) => (
                                <div key={comment.id}>
                                    { loading? <Skeleton width="100%"/>: <CommentItem  postId={postId} comment={comment} setUpperLoading={setLoading} setAlert={setAlert}/> }
                                    <Divider variant="middle"/>
                                </div>))
                        }
                        </List>
                } </>
            }
        </div>
    )
}

export default CommentList