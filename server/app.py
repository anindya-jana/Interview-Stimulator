from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from questiongenerator import QuestionGenerator
from PyPDF2 import PdfReader # type: ignore
import tempfile
import os

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
            num_questions=15,
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


if __name__ == '__main__':
    print("🚀 Server is running at http://localhost:5000")
    app.run(debug=True, port=5000)
