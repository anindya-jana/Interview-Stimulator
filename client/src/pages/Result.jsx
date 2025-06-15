import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Result = () => {
  const { results } = useContext(AppContext);

  const generatePDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Interview Test Report', 14, 22);

  const tableColumn = ["Q#", "Question", "Correct Answer", "Your Answer", "Emotion", "Accuracy %"];
  const tableRows = [];

  results.forEach((r, index) => {
    tableRows.push([
      index + 1,
      r.question,
      r.correctAnswer,
      r.userAnswer,
      r.emotion,
      `${r.similarity}%`
    ]);
  });

  autoTable(doc, {
    startY: 30,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [63, 81, 181] }
  });

  doc.save('interview_test_report.pdf');
};

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-700 text-lg">
        No results to show. Please take the test first.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📝 Interview Summary</h2>

      <button
        onClick={generatePDF}
        className="mb-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition"
      >
        📥 Download Report as PDF
      </button>

      <div className="w-full max-w-4xl">
        <ul className="space-y-4">
          {results.map((r, idx) => (
            <li key={idx} className="bg-white border border-gray-200 p-4 rounded-xl shadow">
              <p className="text-lg font-medium"><strong>Q{idx + 1}:</strong> {r.question}</p>
              <p><strong>✅ Correct Answer:</strong> {r.correctAnswer}</p>
              <p><strong>🗣️ Your Answer:</strong> {r.userAnswer}</p>
              <p><strong>😊 Emotion:</strong> {r.emotion}</p>
              <p><strong>📊 Accuracy:</strong> {r.similarity}%</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Result;
