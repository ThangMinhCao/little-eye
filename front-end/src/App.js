import React, { useEffect, useState } from "react";
import "./App.css";
import Webcam from "react-webcam";
import Card from "@mui/material/Card";
import useSpeechToText from "react-hook-speech-to-text";
import { textTSpeech } from "./textToSpeech";
import Blob from "./components/Blob_Background/Blob";
import Header from "./components/Header/Header";
import CircularProgress from '@mui/material/CircularProgress';

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
  const [showingColors, setShowingColors] = useState(false);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);


  const capturePhoto = React.useCallback(() => {
    const screenshot = webcamRef.current.getScreenshot();
    return screenshot;
  }, [webcamRef]);

  useEffect(() => {
    startSpeechToText();
  }, []);

  const getIndex = (voiceInput) => {
    for (let i = 0; i < objects.length; i++) {
      if (voiceInput.toLowerCase().includes(objects[i].toLowerCase()))
        return i;
    }
    return -1;
  }

  useEffect(() => {
    if (Boolean(interimResult)) {
      setCurrentResult(interimResult);

      console.log(interimResult);
      if (stage === 0 && interimResult.trim().toLowerCase().includes("capture")) {
        const img = capturePhoto();
        setOriImg(img);

        stopSpeechToText();
        setLoading(true);
        fetch("http://localhost:8080/api/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ base64: img }),
        })
          .then((response) => response.json())
          .then(async (data) => {
            console.log("Success:", data);
            setLoading(false);
            setNewImg(data.url); 
            setObjects(data.objects.map(obj => obj.toLowerCase()));
            textTSpeech(data, 0, "")
            setStage(1);

            await delay(objects.length * 1000 + 6000)

            startSpeechToText();
          })
          .catch((error) => {
            setLoading(false);
            console.error("Error:", error);
          });
      } else if (stage === 1) {
        for (let i = 0; i < objects.length; i++) {
          const index = getIndex(interimResult)
          if (index !== -1) {
            stopSpeechToText();
            setLoading(true);

            fetch(`http://localhost:8080/api/color`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ base64: oriImg, object_index: index }),
            })
              .then((response) => response.json())
              .then(async (data) => {
                console.log("Success:", data);
                setColors(data.colors);
                setShowingColors(true);
                textTSpeech(data, 1, objects[index])
                setLoading(false);
                await delay(objects.length * 1000 + 8000)
                startSpeechToText();
              })
              .catch((error) => {
                setLoading(false);
                console.error("Error:", error);
              });
            
            break;
          }
        }
      }
    }
  }, [interimResult]);

  return (
    <div className="App">
      <Header/>
      <Blob/>
      <Card elevation={10} sx={{ height: "70%", width: "900px", borderRadius: 5 }}>
        {
          stage === 0
          ? <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="cam" />
          : <img src={newImg} />
        }
      </Card>
      {
        !showingColors
        ? null
        : (!loading 
          ? <div style={{ position: "absolute", display: "flex", justifyContent: "space-around", width: "65%", bottom: 30 }}>
              {
                colors.map((c, i) => <Card style={{ color: "white", paddingTop: 15, textAlign: "center", width: 200, height: 50, backgroundColor: `rgb(${c[2][0]}, ${c[2][1]}, ${c[2][2]})` }}>{c[0]}</Card>)
              } 
            </div>
          : null)
      }
      
      {/* <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button> */}
      {/* <p>{currentResult}</p> */}
      {
        loading ? <CircularProgress style={{ position: "absolute", bottom: 30 }} /> : null
      }
    </div>
  );
};

export default App;
