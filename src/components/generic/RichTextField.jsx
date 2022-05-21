import { useState, useEffect, useRef, forwardRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { TextField, InputAdornment, Popper } from '@material-ui/core';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';

import EmojiPicker from './EmojiPicker';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'inline'
    },
    icon: {
        color: theme.palette.grey[400]
    },
    button: {
        cursor: 'pointer'
    }
}));

const RichTextField = forwardRef(({value, minLength, maxLength, placeholder}, ref) => {
    const styles = useStyles();
    const anchorRef = useRef();

    const [emoji, setEmoji] = useState(false);
    
    const handleChange = () => {
    }

    const toggleEmoji = () => {
        setEmoji(!emoji);
    }

    const addEmoji = (emoji) => {
        ref.current.value = ref.current.value + emoji.native;
        setEmoji(!emoji);
        ref.current.focus();
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            ref.current.focus();
        }, 100);

        return () => {
          clearTimeout(timeout);
        };
    }, []);

    return (
        <>
            <TextField
                onChange={handleChange}
                multiline
                maxRows={4}
                inputProps={{ minLength: (minLength || 2),  maxLength: (maxLength || 512) }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start" onClick={toggleEmoji} className={styles.button}>
                            <EmojiEmotionsOutlinedIcon size="small" className={styles.icon} ref={anchorRef}/>
                        </InputAdornment>
                    )
                }}
                fullWidth={true}
                inputRef={ref}
                defaultValue={value}
                className={styles.root}
                variant="outlined"
                size="small"
                placeholder={placeholder || ''}
                onFocus={(event) => event.target.selectionStart = event.target.value.length}
                autoFocus
            />
            <Popper open={emoji} anchorEl={anchorRef.current}>
                <div>
                    <EmojiPicker onEmojiSelect={addEmoji}/>
                </div>
            </Popper>
        </>
    );
});

export default RichTextField