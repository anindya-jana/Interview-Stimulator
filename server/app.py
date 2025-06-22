from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from questiongenerator import QuestionGenerator
from PyPDF2 import PdfReader # type: ignore
import tempfile
import os

import base64
import numpy as np
import cv2
from camera_cheater_detector import cheat_detector 
from emotion_detector import get_predict_feat, loaded_model, encoder2, emotions1
from audio_to_txt import audio_to_text
from accuracydetector import accuracy_detector
app = Flask(__name__)
CORS(app) 

# Initialize the question generator once
qg = QuestionGenerator()

def extract_text_from_pdf(pdf_file) -> str:
    """Extracts text from PDF file object."""
    pdf_reader = PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "API is running on http://localhost:5000"}), 200




@app.route('/api/qa', methods=['POST'])
def generate_questions():
    if 'pdf' not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400

    file = request.files['pdf']

    try:
        text = extract_text_from_pdf(file)

        # Generate Q&A
        qa_list = qg.generate(
            text,
            num_questions=5,
            answer_style="sentences",
            use_evaluator=True
        )

        formatted_qa = []
        for i, qa in enumerate(qa_list):
            formatted_qa.append({
                "Question": f"{qa['question']}",
                "Answer": qa['answer']
            })

        return jsonify({
            "success": True,
            "message": "Questions generated successfully",
            "qa_pairs": formatted_qa
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error generating questions: {str(e)}",
            "qa_pairs": []
        }), 500



@app.route('/api/cheat_detection', methods=['POST'])
def detect_cheat():
    try:
        data = request.get_json()
        image_b64 = data.get("image")

        if not image_b64:
            return jsonify({"error": "No image received"}), 400

        # Remove base64 prefix if present
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]

        # Decode and convert to OpenCV frame
        image_bytes = base64.b64decode(image_b64)
        np_array = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        # Call your YOLOv8-based cheat detection logic
        anomaly = cheat_detector(frame)
        print(anomaly)
        return jsonify({
            "status": "processed",
            "anomaly": anomaly if anomaly else "All clear"
        }), 200

    except Exception as e:
        print("Error:", str(e))



@app.route('/api/response', methods=['POST'])
def process_audio():
    # Check if file part exists
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio = request.files['audio']
    correct_answer=request.form.get('correct_answer')
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        audio.save(tmp.name)
        audio_path = tmp.name

    try:
        features = get_predict_feat(audio_path)
        predictions = loaded_model.predict(features)
        y_pred = encoder2.inverse_transform(predictions)
        emotion = y_pred[0][0]

        # Get additional fields from form (if needed)
        correct_answer = request.form.get('correct_answer', '')

        text = audio_to_text(audio_path)
        similarity = accuracy_detector(text,correct_answer) 

        result = {
            'emotion': emotion,
            'text': text,
            'similarity': similarity,
        }
        return jsonify(result)
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'Failed to process audio'}), 500
    finally:
        # Clean up temp file
        os.remove(audio_path)


if __name__ == '__main__':
    print("🚀 Server is running at http://localhost:5000")
    app.run(debug=True, port=5000)
