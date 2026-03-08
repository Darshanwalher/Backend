import { useEffect, useRef, useState } from "react";
import { detect, init } from "./utils/utils.js";
import "./faceExpression.scss";

export default function FaceExpression({ onClick = () => { } }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null); 
  const [expression, setExpression] = useState("Ready");

  useEffect(() => {
    init({ landmarkerRef, videoRef, streamRef });

    return () => {
      if (landmarkerRef.current) landmarkerRef.current.close();
      // Safety: check both the ref and the srcObject to ensure the camera stops
      const stream = streamRef.current || videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function handleDetect() {
    // 1. ADD AWAIT HERE: detect is an async operation
    const detectedExpression = await detect({ landmarkerRef, videoRef, setExpression });
    
    console.log("Detected Mood:", detectedExpression);
    
    // 2. Pass the actual result to the parent
    if (detectedExpression) {
      onClick(detectedExpression);
    }
  }

  // Helper for CSS class safety
  const moodClass = expression.toLowerCase().replace(/\s+/g, '-');

  return (
    <main className="expression-page">
      <div className="background-visuals">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="scanner-container">
        <div className="brand-header">
          <h1>Mood Scanner</h1>
          <p>Let your face pick the frequency.</p>
        </div>

        <div className="video-wrapper">
          <video 
            ref={videoRef} 
            playsInline 
            autoPlay 
            muted 
            className="mood-video" 
          />
          <div className="scan-line"></div>
          <div className="corners"><span></span><span></span><span></span><span></span></div>
        </div>

        <div className="result-card">
          <p className="label">Current Vibe</p>
          <h2 className={`expression-text ${moodClass}`}>
            {expression}
          </h2>
        </div>

        <button className="button detect-btn" onClick={handleDetect}>
          Analyze Expression
        </button>
      </div>
    </main>
  );
}
