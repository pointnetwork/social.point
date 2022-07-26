import Typography from '@material-ui/core/Typography';
import { useEffect, useState } from "react";
import processString from 'react-process-string';

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

function TextContent({ content }) {
    const [rendered, setRendered] = useState(content);

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
            regex: /\@([a-z0-9_\-]{1,15})( |\,|$|\.)/gim, //regex to match a username
            fn: (key, result) => {
                let username = result[1];
                return <span key={key}><a href={`/profile/${username}`}>@{username}</a>&nbsp;</span>
            }

        }];

        setRendered(processString(config)(content));

    }, []);

    return <Typography variant="body1" component="p">{rendered}</Typography>
}

export default TextContent