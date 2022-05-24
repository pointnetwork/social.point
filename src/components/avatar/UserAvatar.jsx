import { useState, useEffect } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import { Avatar } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Link } from "wouter";

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

const useStyles = makeStyles((theme) => ({
    root: {
        cursor:'pointer',
    },
}));

const UserAvatar = ({user, address, upperLoading, setAlert, src, link = true, props}) => {

    const styles = useStyles();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState();
    const [avatar, setAvatar] = useState(EMPTY);
    const [color, setColor] = useState((address && `#${address.slice(-6)}`) || '#f00');

    const { walletAddress, profile, identity } = useAppContext();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {

        if (address === walletAddress) {
            setColor(`#${address.slice(-6)}`);
        }
        else {
            if (user && user.address && user.avatar && user.name) {
                setName(user.name);
                setAvatar(user.avatar);
                setColor((user.address && `#${user.address.slice(-6)}`) || '#f00');
            }
            else {
                try {
                    setLoading(true);
                    const {data: profile} = await window.point.contract.call({contract: 'PointSocial', method: 'getProfile', params: [address]});
                    const {data: {identity}} = await window.point.identity.ownerToIdentity({owner: address});
                    const {data: name} = (profile[0] === EMPTY)? {data:identity} : await window.point.storage.getString({ id: profile[0], encoding: 'utf-8' });
                    setName(name);
                    setAvatar(`/_storage/${profile[3] || EMPTY }`);
                    setColor(`#${address.slice(-6)}`);
                }
                catch(error) {
                    setAlert(error.message);
                }
                finally {
                    setLoading(false);
                }    
            }
        }
    }

    const userAvatar = <Avatar aria-label="avatar" alt={(name||"").toUpperCase()} src={src || avatar} className={styles.root} style={{backgroundColor: color }} {...props}/>
    const ownAvatar = <Avatar aria-label="avatar" alt={(((profile && profile.displayName) || identity)||"").toUpperCase()} src={src || (`/_storage/${(profile && profile.avatar) || EMPTY }`)} className={styles.root} style={{backgroundColor: color }} {...props}/>
    const avatarComponent = (address === walletAddress)?ownAvatar:userAvatar;

    return (
        (loading || upperLoading)
        ? <Skeleton variant="circle"><Avatar /></Skeleton>
        : 
            (link)?
                <Link to={`/profile/${address}`}>{avatarComponent}</Link>
            :
            avatarComponent
        
    );
};

export default UserAvatar