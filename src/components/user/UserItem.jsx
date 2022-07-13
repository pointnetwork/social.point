import { useState, useEffect } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import UserAvatar from "../avatar/UserAvatar";

import point from "../../services/PointSDK";
import UserManager from "../../services/UserManager";

const useStyles = makeStyles((theme) => ({
    root: {
        cursor:'pointer',
    },
}));

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

const UserItem = ({address}) => {

    const styles = useStyles();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');



    const { walletAddress, profile, identity } = useAppContext();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        setLoading(true);
        if (address.toString().toLowerCase() === walletAddress.toString().toLowerCase()) {
            setName((profile && profile.displayName) || identity);
            setAbout(profile.displayAbout || "Hey I'm using Point Social!");
        }
        else {
            try {
                const profile = await UserManager.getProfile(address);
                const { identity } = await point.ownerToIdentity(address);
                const name = (profile[0] === EMPTY)? identity : await point.getString(profile[0], {  encoding: 'utf-8' });
                const about = (profile[2] === EMPTY)? "Hey I'm using Point Social!" : await point.getString(profile[2], {encoding: 'utf-8'});
                setName(name);
                setAbout(about);
            }
            catch(error) {}        
        }
        setLoading(false);
    }

    return (
        <>
            <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    <UserAvatar address={address}/>
                </ListItemAvatar>
                <ListItemText primary={name} secondary={about}/>
            </ListItem>
            <Divider variant="middle"/>
        </>
    );

};

export default UserItem