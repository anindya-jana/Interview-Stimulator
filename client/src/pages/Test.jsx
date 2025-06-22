import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaMicrophone, FaStop, FaPaperPlane, FaVideo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const { qaList, results, setResults } = useContext(AppContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const currentQA = qaList?.[currentIndex];

  useEffect(() => {
    if (currentIndex === 0) {
      setResults([]); 
    }
  }, [currentIndex]);

  // Webcam cheating detection snapshot every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSendFrame();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const captureAndSendFrame = async () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    try {
      const res = await axios.post(`${backendUrl}/api/cheat_detection`, { image: screenshot });
      const anomaly = res.data.anomaly;

      if (anomaly !== "All clear") {
        toast.error(`Anomaly detected: ${anomaly}`);
      }
    } catch (err) {
      console.error("Cheat detection error", err.message);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('correct_answer', currentQA.answer);

    setProcessing(true);

    try {
      const res = await axios.post(`${backendUrl}/api/response`, formData);
      const { emotion, text, similarity } = res.data;

      setResults((prev) => [
        ...prev,
        {
          question: currentQA.Question,
          correctAnswer: currentQA.Answer,
          userAnswer: text,
          emotion,
          similarity,
        },
      ]);

      setAudioBlob(null);
      setProcessing(false);

      if (currentIndex + 1 < qaList.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(currentIndex + 1);
        toast.success("Test completed!");
      }
    } catch (err) {
      toast.error("Error processing voice. Try again.");
      setProcessing(false);
    }
  };

  if (currentIndex < qaList.length && !currentQA) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-600">
        No questions loaded. Please start the test properly.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-r from-indigo-100 to-gray-100">
      {currentIndex < qaList.length && (
        <>
          <motion.h2
            className="text-3xl font-bold mb-4 text-indigo-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Interview Question {currentIndex + 1} of {qaList.length}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl items-start">
            
            {/* Question Box */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-lg text-gray-800 mb-6 font-medium">
                {currentQA.Question}
              </p>

              <div className="flex flex-col items-center gap-4">
                {!recording && (
                  <button
                    onClick={handleStartRecording}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full flex items-center gap-2"
                  >
                    <FaMicrophone /> Start Recording
                  </button>
                )}

                {recording && (
                  <button
                    onClick={handleStopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full flex items-center gap-2"
                  >
                    <FaStop /> Stop Recording
                  </button>
                )}

                {audioBlob && !processing && (
                  <button
                    onClick={handleSubmitAnswer}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-full flex items-center gap-2"
                  >
                    <FaPaperPlane /> Submit Answer
                  </button>
                )}

                {processing && (
                  <p className="text-indigo-600 font-semibold mt-2">
                    Analyzing your voice response...
                  </p>
                )}
              </div>
            </motion.div>

            {/* Webcam Preview */}
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
                <FaVideo /> Cheat Detection Activated
              </div>

              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                className="rounded-xl border border-gray-300 shadow"
                videoConstraints={{ facingMode: "user" }}
              />
            </motion.div>
          </div>
        </>
      )}

      {currentIndex === qaList.length && !processing && (
        <motion.div
          className="mt-10  text-center w-full max-w-xl py-[5rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-green-700 mb-2 justify-center">🎉 Congratulations!</h3>
          <p className="text-gray-700 text-md mb-4">
            You’ve successfully completed your test. Great job!
          </p>
          <p className="text-gray-600 text-sm mb-6 italic">
            Our platform combines voice analysis, emotion detection, and real-time monitoring to simulate a real-world interview experience and help you grow confidently.
          </p>
          <button
            onClick={() => navigate('/result')}
            className="mt-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700 transition-all duration-200"
          >
            📊 See Interview Report
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Test;
