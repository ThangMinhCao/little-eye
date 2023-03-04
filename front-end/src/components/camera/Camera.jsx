import React, {useRef, useState, useEffect} from "react";
import styles from "./styles.module.css";
import canvasToImage from 'canvas-to-image';

const Camera = () => {
   const videoRef = useRef(null);
   const photoRef = useRef(null);

   const [hasPhoto, setHasPhoto] = useState(false);

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

      const dataURL = photoRef.current.toDataURL('../image/');
      const link = document.createElement('a');
      link.download = 'myImage.png';
      link.href = dataURL;
      link.click();


      console.log('Saved!');


      setHasPhoto(true); 
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
            <canvas ref={photoRef}></canvas>
            <button onClick={closePhoto}>Close</button>
         </div>
      </div>
   )
}

export default Camera;