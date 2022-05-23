import { useEffect, useState, useRef } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';

import { format } from "timeago.js";
import { Link } from "wouter";

import CollapsibleTypography from '../generic/CollapsibleTypography';
import UserAvatar from '../avatar/UserAvatar';
import RichTextField from '../generic/RichTextField';

import {Button,
        Dialog,
        DialogActions,
        DialogContent,
        DialogContentText,
        DialogTitle,
        IconButton,
        Menu,
        MenuItem,
        ListItem,
        ListItemText,
        ListItemAvatar,
        ListItemIcon,
        ListItemSecondaryAction,
        Typography
    } from '@material-ui/core';

import Skeleton from '@material-ui/lab/Skeleton';

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

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
    avatar: {
        cursor:'pointer'
    },
    action: {
        top: theme.spacing(2)
    },    
    block: {
        display: 'block',
    },
    inline: {
        display: 'inline',
    },
    item: {
        listStyleType: "none"
    }
    
}));

const CommentItem = ({postId, comment, parentDeleteComment, setAlert, preloaded = false, preloadedData}) => {

    const [loading, setLoading] = useState(false);

    const [actionsOpen, setActionsOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [prompt, showPrompt] = useState(false);

    const styles = useStyles();
    
    const { walletAddress, profile, identity } = useAppContext();

    const [name, setName] = useState();
    const [content, setContent] = useState();
    const [date, setDate] = useState();

    const actionsAnchor = useRef();
    const inputRef = useRef();
    
    useEffect(() => {
        if (preloaded) { setPreloadedComment() }
        else { loadComment() }
    }, []);

    const setPreloadedComment = () => {
        setName((comment.from === walletAddress)? 
                ((profile && profile.displayName)||identity):
                preloadedData.name);
        setDate(comment.createdAt);
        setContent(preloadedData.contents);
    };

    const loadComment = async () => {

        setLoading(true);

        if (comment.from === walletAddress) {
            setName((profile && profile.displayName)||identity);
        }
        else {
            try {
                const {data: profile} = await window.point.contract.call({contract: 'PointSocial', method: 'getProfile', params: [comment.from]});
                const {data: {identity}} = await window.point.identity.ownerToIdentity({owner: comment.from});
                const {data: name} = (profile[0] === EMPTY)? {data:identity} : await window.point.storage.getString({ id: profile[0], encoding: 'utf-8' });
                setName(name);
            }
            catch(error) {
                setAlert(error.message);
            }
        }

        setDate(comment.createdAt);

        try {
            const {data: contents} = (comment.contents === EMPTY)? {data:""} : await window.point.storage.getString({ id: comment.contents, encoding: 'utf-8' });
            setContent(contents);
        }
        catch(error) {
            setAlert(error.message);
        }

        setLoading(false);
    };

    const handleAction = (action) => {

        setActionsOpen(false);  

        switch(action) {
          case 'edit':
            startEdit();
          break;
          case 'save':
            saveEdit();
            break;
          default:
          case 'cancel':
            cancelEdit();
          break;
          case 'delete':
            showPrompt(true);
          break;
        }
    };

    const deleteComment =  async () => {
        try {
            setLoading(true);
            await window.point.contract.send({contract: 'PointSocial', method: 'deleteCommentForPost', params: [postId, comment.id]});
            parentDeleteComment(comment.id);
        }
        catch(error) {
            setAlert(error.message);
            setLoading(false);
        }
    };

    const cancelEdit = function() {
        setEdit(false);
    };
    
    const startEdit = () => {
        setEdit(true);
    };

    const saveEdit = async () => {
        try {
            const contents = inputRef.current.value.trim();
            setLoading(true);
                    
            const {data: storageId} = await window.point.storage.putString({data: contents});
            const result = await window.point.contract.send({contract: 'PointSocial', method: 'editCommentForPost', params: [comment.id, storageId]});

            setContent(contents);
            setEdit(false);
        }
        catch(error) {
            setAlert(error.message);
        }
        finally {
            setLoading(false);
        }
    };
    
    const handleActionsOpen = () => {
        setActionsOpen(true);
    };
    
    const handleActionsClose = () => {
        setActionsOpen(false);
    };

    const commentActions = <>
        <Menu id="actions-menu"
            anchorEl={actionsAnchor.current}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            getContentAnchorEl={null}
            onClose={handleActionsClose}
            open={actionsOpen}>
        {!edit && 
            <MenuItem onClick={(event) => handleAction('edit')}>
            <ListItemIcon style={{margin: 0}} size="small">
                <EditOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Edit</Typography>
            </MenuItem>
        }
        {!edit && 
            <MenuItem onClick={(event) => handleAction('delete')}>
            <ListItemIcon style={{margin: 0}} size="small">
                <DeleteOutlineOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Delete</Typography>
            </MenuItem>
        }
        {edit && 
            <MenuItem onClick={(event) => handleAction('cancel')}>
            <ListItemIcon style={{margin: 0}} size="small">
                <CancelOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Cancel</Typography>
            </MenuItem>
        }
        {edit && (inputRef && inputRef.current && inputRef.current.value && inputRef.current.value.trim() && (inputRef.current.value.trim() !== content)) &&
            <MenuItem onClick={(event) => handleAction('save')}>
            <ListItemIcon style={{margin: 0}} size="small">
                <SaveOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Save</Typography>
            </MenuItem>
        }
        </Menu>
    </>
    
    const dialog = <>
        <Dialog
            open={prompt}
            aria-labelledby="alert-dialog-prompt-delete"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Delete comment?"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete the comment? This action cannot be undone
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => showPrompt(false)} color="primary">
                Cancel
            </Button>
            <Button onClick={deleteComment} color="primary" autoFocus>
                Ok
            </Button>
            </DialogActions>
        </Dialog>
    </>

    return (
        <div style={{ position: "relative"}}>
            <ListItem alignItems={edit?"center":"flex-start"} component="div" className={styles.item}> 
                <ListItemAvatar>
                    <UserAvatar address={comment.from} upperLoading={loading} setAlert={setAlert}/>
                </ListItemAvatar>
                {
                    edit
                    ?
                        loading ? <Skeleton width="100%" height="100%"/> : <RichTextField ref={inputRef} value={content}/>
                    : 
                        <>                        
                            <ListItemText 
                                primary={
                                    <>
                                        <Link to={`/profile/${comment.from}`}>
                                            <Typography variant="subtitle1" style={{cursor:'pointer'}} display="inline">
                                            {
                                                loading
                                                ?
                                                    <Skeleton />
                                                :
                                                    (comment.from === walletAddress) ? ((profile && profile.displayName) || identity) : name
                                            }
                                            </Typography>
                                        </Link>
                                        <Typography variant="caption" display="inline" color="textSecondary" style={{ marginLeft: '8px', marginRight: '6px' }}>•</Typography>
                                        <Typography variant="caption" display="inline" color="textSecondary"> {loading ? <Skeleton /> : format(date) }</Typography>
                                    </>                    
                                }
                                secondary={
                                    (content === "")
                                    ?
                                        <Typography component="span" variant="caption" color="textSecondary" align="left" noWrap={true}>
                                            {loading ? <Skeleton /> : "(empty comment)" }
                                        </Typography>
                                    :
                                        <CollapsibleTypography content={content} loading={loading}/>
                                }
                            />
                        </>
                }
                {
                    !loading &&  walletAddress === comment.from &&
                    <ListItemSecondaryAction className={styles.action}>
                        <IconButton edge="end" size="small" aria-label="comment-menu" aria-haspopup="true" ref={actionsAnchor} onClick={handleActionsOpen}>
                            <MoreHorizOutlinedIcon fontSize="small"/>
                        </IconButton>
                        { commentActions }
                    </ListItemSecondaryAction>
                }
            </ListItem>
            {dialog}
        </div>
    )
}

export default CommentItem