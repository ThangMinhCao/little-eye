import React, { useEffect, useState } from "react";
import "./App.css";
import Webcam from "react-webcam";
import Card from "@mui/material/Card";
import useSpeechToText from "react-hook-speech-to-text";
import { storage, uploadImage } from "./services/firebase";

// function handleUpload() {
//   if (!file) {
//     alert("Please choose a file first!");
//   }
//   const storageRef = ref(storage, `/files/${file.name}`);
//   const uploadTask = uploadBytesResumable(storageRef, file);
//   uploadTask.on(
//     "state_changed",
//     (snapshot) => {
//       const percent = Math.round(
//         (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//       ); // update progress
//       setPercent(percent);
//     },
//     (err) => console.log(err),
//     () => {
//       // download url
//       getDownloadURL(uploadTask.snapshot.ref).then((url) => {
//         console.log(url);
//       });
//     }
//   );
// }

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

const App = () => {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });
  const webcamRef = React.useRef(null);
  const [currentResult, setCurrentResult] = useState("");
  const capturePhoto = React.useCallback(
    () => {
      const screenshot = webcamRef.current.getScreenshot();
      // const img = new Image();
      // img.src = screenshot.replace(/^data:image\/[a-z]+;base64,/, "");
      // return screenshot.replace(/^data:image\/[a-z]+;base64,/, "");
      return screenshot;
    },
    [webcamRef]
  );
  const [img, setImg] = useState(null);

  useEffect(() => {
    startSpeechToText();
  }, []);

  useEffect(() => {
    if (Boolean(interimResult)) {
      setCurrentResult(interimResult);

      console.log(interimResult)
      if (interimResult.trim() === "capture") {
        console.log("capture22")
        const img = capturePhoto();
        setImg(img);

        console.log(img);
        // setImg(img.replace('dataimage/jpegbase64', ''));
        // uploadImage(_base64ToArrayBuffer(img));
        uploadImage(img);
      }
        // send POST request to backend

        // fetch("http://localhost:5000/api/image", {
        //   method: "POST",
        //   body: JSON.stringify({ url: "thefkingurl" }),
        // });
    }
  }, [interimResult]);

  return (
    <div className="App">
      <Card sx={{ height: "70%", width: "900px", borderRadius: 5 }}>
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="cam" />
      </Card>
      <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <p>{currentResult}</p>
      <img src={img}/>
    </div>
  );
};

export default App;
