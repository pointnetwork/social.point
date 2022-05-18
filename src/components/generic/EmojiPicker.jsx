import { useEffect, useRef } from "react";

import data from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

const EmojiPicker = (props) => {
    const ref = useRef();

    useEffect(() => {
        try {
            new Picker({ ...props, data, ref })
        }
        catch(error) {
            console.log(error);
        }
    }, []);
    
    return <div ref={ref} />
}

export default EmojiPicker