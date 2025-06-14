import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Header = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const { setQAList, setIsGenerated} = useContext(AppContext);

  // Triggered on file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setPdfName(file.name);
  };

  // Triggered on submit button click
  const handlePDFUpload = async () => {
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const res = await axios.post(backendUrl+'/api/qa', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;
      setQAList(data.qa_pairs);
      setIsGenerated(true)
    } catch (error) {
      toast.error(`Error uploading PDF: ${error.message}`);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col md:flex-row">
      {/* Left Section - Greeting */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full md:w-1/2 flex flex-col justify-center items-start px-6 sm:px-12 lg:px-20 py-16"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight mb-4">
          Welcome to <br />
          <span className="text-indigo-600">InterviewVerse</span>
        </h1>
        <p className="text-md sm:text-lg text-gray-700 max-w-lg">
          Sharpen your skills with our smart mock interview simulator. Upload your question set and practice with real-time voice input, emotional analysis, and cheat detection.
        </p>
      </motion.div>

      {/* Right Section - Upload */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        className="w-full md:w-1/2 flex justify-center items-center px-6 sm:px-12 py-16"
      >
        <div className="bg-gray-100 rounded-3xl shadow-lg hover:shadow-indigo-200 transition-all duration-300 p-8 sm:p-10 w-full max-w-md border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
            Upload Your Interview PDF
          </h2>

          <div className="flex flex-col items-center gap-4">
            <label className="w-full">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-500 file:text-white
                  hover:file:bg-indigo-600 cursor-pointer"
              />
            </label>

            {pdfName && (
              <p className="text-sm text-green-600 text-center">
                ✅ {pdfName}
              </p>
            )}

            {pdfFile && <button
              onClick={handlePDFUpload}
              className="mt-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full shadow hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Header;
