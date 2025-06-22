# 🛡️ InterviewVerse - AI Interview Platform

An intelligent proctoring platform that conducts interviews and monitors for cheating using real-time webcam analysis and voice recordings. The app uses **YOLOv8** for visual cheating detection and **Flask** as the backend.

---

## 🚀 Features

* 🎤 **Voice Answer Submission** using microphone
* 🤖 **Real-time AI Proctoring** via webcam
* 🧠 **YOLOv8-based Cheat Detection** (e.g., phone usage, no person present)
* 📊 **Detailed Interview Report** at the end
* ⚠️ **Instant Cheat Alerts** via toast notifications

---

## 📂 Project Structure

```
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Test.jsx       # Test logic with voice + webcam
│   │   │   ├── Result.jsx     # Shows test summary
│   │   │   └── Home.jsx
│   │   └── context/
│   │       └── AppContext.js  # Global state context
│   └── ...
│
├── server/                    # Flask Backend
│   ├── app.py                 # Main Flask app
│   ├── cheat_detector.py      # YOLOv8 cheat detection logic
│   ├── requirements.txt
│   └── .....    
```

---

## ⚙️ Tech Stack

* **Frontend:** React, Tailwind CSS, Axios, Framer Motion, React Webcam
* **Backend:** Flask, OpenCV, Ultralytics YOLOv8, NLP, Spacy
* **ML Model:** YOLOv8s (`ultralytics/yolov8s.pt`)
* **Other:** Flask-CORS, EventSource, Python-Torch

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/pritam890/Interview-Stimulator
cd Interview-Stimulator
```

---

### 2. Backend Setup (Flask + YOLOv8)

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Make sure to install YOLOv8:

```bash
pip install ultralytics opencv-python
```

Start the Flask server:

```bash
python app.py
```

---

### 3. Frontend Setup (React)

```bash
cd client
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🧠 Cheat Detection Logic

* Captures webcam frames every **3 seconds**
* Uses YOLOv8 to detect:

  * 📱 **Cell phones**: triggers "Mobile Phone Detected"
  * 🙈 **No person**: triggers "No Person Detected"
* Returns `anomaly: "All clear"` if no issues


## 📃 License

MIT License © 2025 \[Pritam Adhikari, Anindya Jana]

---

