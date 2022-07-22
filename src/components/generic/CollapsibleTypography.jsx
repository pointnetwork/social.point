import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import processString from 'react-process-string';

const useStyles = makeStyles((theme) => ({
    block: {
        display: 'block',
        cursor:'pointer',
        width: '100%'
    },
    inline: {
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor:'pointer',
        width: '100%'
    }
}));

const CollapsibleTypography = ({content, loading}) => {
    const [collapsed, setCollapsed] = useState(true);
    const [rendered, setRendered] = useState(content);
    const styles = useStyles();

    useEffect(() => {

        let config = [{
            regex: /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
            fn: (key, result) => <span key={key}>
                                     <a target="_blank" rel="noreferrer" href={`${result[1]}://${result[2]}.${result[3]}${result[4]}`}>{result[2]}.{result[3]}{result[4]}</a>{result[5]}
                                 </span>
        }, {
            regex: /(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
            fn: (key, result) => <span key={key}>
                                     <a target="_blank" rel="noreferrer" href={`http://${result[1]}.${result[2]}${result[3]}`}>{result[1]}.{result[2]}{result[3]}</a>{result[4]}
                                 </span>
        }, {
            regex: /\@([a-z0-9_\-]{1,15}+)( |\,|$|\.)/gim, //regex to match a username
            fn: (key, result) => {
                let username = result[1];
                return <span key={key}><a href={`/profile/${username}`}>@{username}</a>&nbsp;</span>
            }

        }];

        setRendered(processString(config)(content));

    }, []);


    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    }

    return (
        collapsed
        ?
        <Typography component="span" variant="body2" className={styles.inline} color="textPrimary" align="left" noWrap={true} onClick={toggleCollapse}>
            {loading ? <Skeleton /> : rendered }
        </Typography>
        : 
        <Typography component="span" variant="body2" className={styles.block} color="textPrimary" align="left" onClick={toggleCollapse}>
            {loading ? <Skeleton /> : rendered }
        </Typography>            
    );
};

export default CollapsibleTypography