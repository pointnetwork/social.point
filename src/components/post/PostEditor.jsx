import "./postEditor.css";
import { AttachFileTwoTone } from "@material-ui/icons";
import { useRef, useState } from "react";
import PostManager from "../../services/PostManager"

export default function PostEditor({ post, toggleEditPost, reloadPost }) {
  const DEFAULT_BTN_LABEL = 'Save'
  const EMPTY_MEDIA = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const EMPTY_CONTENT = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const [contents, setContents] = useState(post.contents);
  const [media, setMedia] = useState(post.image);

  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState(`/_storage/${media}`)

  const [btnLabel, setBtnLabel] = useState(DEFAULT_BTN_LABEL);
  const [btnEnabled, setBtnEnabled] = useState(false);

  const [loadImgError, setLoadImgError] = useState(false);
  const [loadVideoError, setLoadVideoError] = useState(false);


  const fileInputRef = useRef()

  const onContentsChange = event => {
    let newContents = event.target.value;
    setContents(newContents);
    setBtnEnabled(newContents && newContents.trim().length > 0);
  }

  const onFileChange = event => {
    let fileToUpload = event.target.files[0];
    if(fileToUpload.type.startsWith('image') || fileToUpload.type.startsWith('video') ) {
      if (fileToUpload.size > 100 * 1024 * 1024){
        alert('Point Social only supports image and video until 100 MB. Please change to a samller image or video file!')  
      }
      setSelectedFile(event.target.files[0]);
      setPreview(URL.createObjectURL(event.target.files[0]));
      setBtnEnabled(true);
    } else {
      alert('Point Social only supports image and video uploads for now. Please change to an image or video file!')
    }
  };

  const onFocus = event => {
    const element = event.target;
    element.selectionStart = element.value.length;
  } 

  const onImgErrorHandler = (e) => {
    setLoadImgError(true);
  }

  const onVideoErrorHandler = (e) => {
    setLoadVideoError(true);
  }

  let mediaTag;
  if (!loadImgError) {
    mediaTag = <img className="postImage" src={preview} onError={onImgErrorHandler} alt=""></img>;
  } else {
    if(!loadVideoError) {
      mediaTag = <video className="postImage" controls><source src={preview} onError={onVideoErrorHandler}></source></video>;
    } else {
      mediaTag = '';
    }
  }

  const postedMedia = (media !== EMPTY_MEDIA) && mediaTag

  const setSaving = (saving) => {
    setBtnEnabled(!saving);
    saving ? setBtnLabel('Saving...') : setBtnLabel(DEFAULT_BTN_LABEL);
  }

  const cancelEditing = () => {
    setSaving(false);
    setBtnEnabled(false);
    toggleEditPost();
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save the post content to the storage layer and keep the storage id
      let {data: storageId} = (contents && contents.trim().length > 0)? await window.point.storage.putString({data: contents}) : { data: EMPTY_CONTENT }; 
      let imageId = media;
      if(selectedFile){
        const formData = new FormData()
        formData.append("postfile", selectedFile);
        const res = await window.point.storage.postFile(formData);
        imageId = res.data;
      }
      // Save the post contents storage id in the PoinSocial Smart Contract
      await PostManager.editPost(post.id, storageId, imageId);
      setSaving(false);
      setContents('');
      setSelectedFile();
      setBtnEnabled(false);
      try { fileInputRef.current.value = null } catch (error) {}
      reloadPost(contents, imageId);      
    } catch (e) {
      console.error('Error sharing post: ', e.message);
      setSaving(false);
      setContents('');
      setSelectedFile();
      setBtnEnabled(false);
      try { fileInputRef.current.value = null } catch (error) {}
    }
  };

  return (
    <div className="postEditor bg-white">
      <textarea
        id="contents"
        name="contents"
        maxLength="300"
        rows="3"
        cols="50"
        className="editInput"
        value={contents}
        onChange={onContentsChange}
        onFocus={onFocus}
        autoFocus
        >
      </textarea>
      { postedMedia }
      <form className="editBottom" onSubmit={submitHandler}>
        <div className="editOptions">
          <div className="editFilePicker">
            <AttachFileTwoTone htmlColor="grey" />
            <input
              type="file"
              name="fileupload"
              accept="image/*,video/*"
              ref={fileInputRef}
              onChange={onFileChange}
            />
          </div>
          <button className="editButton" type="submit" disabled={!btnEnabled}>
            {btnLabel}
            </button>
            <button className="editButton" onClick={cancelEditing}>
            Cancel
            </button>
        </div>
      </form>
    </div>
  );
}
