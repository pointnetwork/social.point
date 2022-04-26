import './comments.css'
import { useState } from "react";

const CommentEditor = ({ commentId, content, toggleEditComment, reloadComments }) => {
    const DEFAULT_BTN_LABEL = 'Comment'

    const [btnLabel, setBtnLabel] = useState(DEFAULT_BTN_LABEL);
    const [btnEnabled, setBtnEnabled] = useState(false);

    const [contents, setContents] = useState(content);

    const onContentsChange = event => {
      let newContents = event.target.value;
      setContents(newContents);
      setBtnEnabled(newContents && newContents.trim().length > 0);
    }
  
    const setSaving = (saving) => {
      setBtnEnabled(!saving);
      saving ? setBtnLabel('Saving...') : setBtnLabel(DEFAULT_BTN_LABEL);
    }

    const cancelEditing = () => {
        setSaving(false);
        setBtnEnabled(false);
        toggleEditComment();
    }

    const onFocus = event => {
        const element = event.target;
        element.selectionStart = element.value.length;
    } 

    const submitHandler = async (e) => {
        e.preventDefault();
        setSaving(true);
          
        try {
            // Save the post content to the storage layer and keep the storage id
            let {data: storageId} = await window.point.storage.putString({data: contents});
            // Save the post contents storage id in the PoinSocial Smart Contract
            await window.point.contract.send({contract: 'PointSocial', method: 'editCommentForPost', params: [commentId, storageId]});
            setSaving(false);
            // calling renderCommentsImmediate instead of fetching the comments due to issues with fetching content too soon from Arweave after posting.
            // PD: using a timeout of 1000 apparently works
            reloadComments();
            setContents('');
            toggleEditComment(false);
        } catch (err) {
          setSaving(false);
          console.error('Error: ', err);
        }
    };
    
    return (
        <div className="commentWrapper">
          <form className="commentBottom" onSubmit={submitHandler}>
            <textarea
                id="contents"
                name="contents"
                maxLength="300"
                rows="3"
                cols="50"              
                className="commentCorners"
                onChange={onContentsChange}
                onFocus={onFocus}
                value={contents}
                autoFocus>
            </textarea>
            <div className="commentButtons">
              <button className="commentButton" onClick={cancelEditing}>
                Cancel
              </button>
              <button className="commentButton" type="submit" disabled={!btnEnabled}>
                {btnLabel}
              </button>
            </div>
          </form>
          <hr className="commentHr" />
        </div>
    )
}

export default CommentEditor