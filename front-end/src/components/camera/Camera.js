import React, {useRef, useState, useEffect} from "react";
import styles from "./styles.module.css";
import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { textToSpeech } from "../../javascript/textToSpeech";

const object = {
   url: 'https://static.wikia.nocookie.net/mana/images/7/71/SD3Poto.png/revision/latest/scale-to-width-down/310?cb=20120108212923',
   objects: ['apple', 'banana', 'shat']
}
const Camera = () => {
   const videoRef = useRef(null);
   const photoRef = useRef(null);

   const [hasPhoto, setHasPhoto] = useState(false);
   const [isProcessingPhoto, setProcessingPhoto] = useState(false);
   const [data, setData] = useState({
      url: '',
      objects: []
   });
   // const [message, setMessage] = useState({
   //    error: "Sorry I cannot find any object. Please try again.",
   //    success: "I found"
   // })

   const getVideo = () => {
      navigator.mediaDevices
         .getUserMedia(
            {video : {width: 1920, height: 1080}
         })
         .then(stream => {
            let video = videoRef.current;
            video.srcObject = stream;
            video.play();
         })
         .catch(err => {
            console.error(err);
         })
         
   }

   const takePhoto = () => {
      const width = 414;
      const height = width / (16/9);

      let video = videoRef.current;
      let photo = photoRef.current;

      photo.width = width;
      photo.height = height;

      let ctx = photo.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      console.log(ctx);
      console.log(photoRef.current);
      //Save image 
      // canvasToImage(photoRef.current);
      setImageUrl(photoRef.current.toDataURL('../image/'));
      setData({url: photoRef.current.toDataURL('../image/'), ...data})
      postUrlAPI();

      setHasPhoto(true); 
   }

   const postUrlAPI = async() => {
      setProcessingPhoto(true);

      const response = await fetch('/api/image', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ url: data.url})
       })
       .then(response => response.json())
       .then(async database => {
         console.log(database);
         setData({objects: database, ...data})
         await textToSpeech(data.objects)
         setProcessingPhoto(false);

       })
       .catch(error => {
         console.error(error);
       });
   }


   const closePhoto = () => {
      let photo = photoRef.current;
      let ctx = photo.getContext('2d');

      ctx.clearRect(0, 0, photo.width, photo.height);

      setHasPhoto(false); 
   }

   useEffect(() => {
      getVideo();
   }, [videoRef])

   return (
      <div className={styles.wrapper}>
         <div className={styles.camera}>
            <video ref={videoRef}></video>
            <button onClick={takePhoto}>Take a picture!</button>
         </div>
         <div className={hasPhoto? styles.resultHasPhoto : styles.result}>
            {isProcessingPhoto ? 
               <div> 
                  <CircularProgress /> 
                  <canvas ref={photoRef}></canvas>
                  <GraphicEqIcon /><h3>Processing image...</h3>
               
               </div>
               : 
               <div> 
                  <img src={data.url} alt="My Image" />
                  <GraphicEqIcon />
               </div>
            
            }
            
         </div>
      </div>
   )
}

export default Camera;