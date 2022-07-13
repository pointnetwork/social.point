import { useEffect, useState, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../context/AppContext';

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

import point from "../../services/PointSDK";
import UserManager from "../../services/UserManager";
import EventConstants from "../../events";

import UserItem from "./UserItem";

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
    list: {
        minHeight: '50vh'        
    }
}));

const UserList = ({users}) => {

    const styles = useStyles();    
    return (
        <div className={styles.root}>
            {
                (users.length === 0)
                ?
                    <Box color="text.disabled" display="flex" justifyContent="center" alignItems="center" height="100%" >
                        <div className={styles.empty}>
                            <InboxOutlinedIcon style={{ fontSize: 32 }} />
                            <Typography variant="caption">No users yet.</Typography>
                        </div>
                    </Box>
                :
                    <List className={styles.root}>
                    {
                        users.map((user) => (
                            <UserItem key={user} address={user}>
                            </UserItem>
                        ))
                    }
                    </List>
            }
        </div>
    )
}

export default UserList