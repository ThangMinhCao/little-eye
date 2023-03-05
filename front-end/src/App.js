import React, { useEffect, useState } from "react";
import "./App.css";
import Webcam from "react-webcam";
import Card from "@mui/material/Card";
import useSpeechToText from "react-hook-speech-to-text";
import { textTSpeech } from "./textToSpeech";
import Blob from "./components/Blob_Background/Blob";
import Header from "./components/Header/Header";

const delay = ms => new Promise(res => setTimeout(res, ms));

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
  const [stage, setStage] = useState(0);
  const [newImg, setNewImg] = useState("");
  const [objects, setObjects] = useState([]);
  const [oriImg, setOriImg] = useState("");

  const capturePhoto = React.useCallback(() => {
    const screenshot = webcamRef.current.getScreenshot();
    return screenshot;
  }, [webcamRef]);

  useEffect(() => {
    startSpeechToText();
  }, []);

  useEffect(() => {
    if (Boolean(interimResult)) {
      setCurrentResult(interimResult);

      console.log(interimResult);
      if (stage === 0 && interimResult.trim() === "capture") {
        const img = capturePhoto();
        setOriImg(img);

        stopSpeechToText();
        fetch("http://localhost:5000/api/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ base64: img }),
        })
          .then((response) => response.json())
          .then(async (data) => {
            console.log("Success:", data);
            setNewImg(data.url); 
            setObjects(data.objects.map(obj => obj.toLowerCase()));
            setStage(1);
            textTSpeech(data)

            await delay(objects.length * 1000 + 6000)

            startSpeechToText();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else if (stage === 1) {
        if (objects.includes(interimResult.trim().toLowerCase())) {
          stopSpeechToText();
          
          fetch(`http://localhost:5000/api/color`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ base64: oriImg, object_index: objects.indexOf(interimResult.toLowerCase()) }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Success:", data);
              // setNewImg(data.url);
              // setStage(2);
              // startSpeechToText();
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }
      }
    }
  }, [interimResult]);

  return (
    <div className="App">
      <Header/>
      <Blob/>
      <Card sx={{ height: "70%", width: "900px", borderRadius: 5 }}>
        {
          stage === 0
          ? <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="cam" />
          : <img src={newImg} />
        }
      </Card>
      {/* <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button> */}
      {/* <p>{currentResult}</p> */}
    </div>
  );
};

export default App;
