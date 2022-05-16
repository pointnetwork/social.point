import { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

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
    const styles = useStyles();

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    }

    return (
        collapsed
        ?
        <Typography component="span" variant="body2" className={styles.inline} color="textPrimary" align="left" noWrap={true} onClick={toggleCollapse}>
            {loading ? <Skeleton /> : content }
        </Typography>
        : 
        <Typography component="span" variant="body2" className={styles.block} color="textPrimary" align="left" onClick={toggleCollapse}>
            {loading ? <Skeleton /> : content }
        </Typography>            
    );
};

export default CollapsibleTypography