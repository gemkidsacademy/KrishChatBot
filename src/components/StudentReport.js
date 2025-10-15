import React, { useState } from "react";
import "./StudentReport.css";

const StudentReport = ({ doctorData }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [subject, setSubject] = useState("");
  const [reportData, setReportData] = useState([]);
  const [missingQuestions, setMissingQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchReport = async () => {
    if (!fromDate || !toDate || !subject) {
      alert("Please select From Date, To Date, and Subject.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch completed reflections
      const res = await fetch(
        "https://usefulapis-production.up.railway.app/student_report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: doctorData.id,
            from_date: fromDate,
            to_date: toDate,
            subject: subject,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch report");
      const reflections = await res.json();
      setReportData(reflections);

      // Fetch all questions
      const questionsRes = await fetch(
        "https://usefulapis-production.up.railway.app/questions_a_level"
      );
      if (!questionsRes.ok) throw new Error("Failed to fetch questions");
      const allQuestions = await questionsRes.json();

      // Filter missing questions
      const answeredTexts = new Set(
        reflections.map((r) => r.question_text.trim().toLowerCase())
      );

      const missing = allQuestions.filter(
        (q) =>
          q.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
          !answeredTexts.has(q.question_text.trim().toLowerCase())
      );

      setMissingQuestions(missing);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch report. Please try again later.");
      setReportData([]);
      setMissingQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2 className="report-title">Student Reflection Report</h2>

      {/* Filter Card */}
      <div className="filter-card">
        <div className="filter-item">
          <label>From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>Subject:</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">-- Select Subject --</option>
            <option value="sociology">Sociology</option>
            <option value="economics">Economics</option>
          </select>
        </div>

        <button
          className={`fetch-btn ${loading ? "disabled" : ""}`}
          onClick={handleFetchReport}
          disabled={loading}
        >
          {loading ? "Creating Report..." : "Create Report"}
        </button>
      </div>

      {/* Status Messages */}
      {loading && <p className="status-msg">Loading report...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {/* Completed Reflections */}
      {reportData.length > 0 && (
        <div className="report-section">
          <h3 className="section-title">✅ Completed Reflections</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Question</th>
                  <th>Preparedness</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>{item.question_text}</td>
                    <td>{item.preparedness_level}</td>
                    <td>{item.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Questions */}
      {missingQuestions.length > 0 && (
        <div className="report-section">
          <h3 className="section-title pending">
            ❌ Pending Questions (Not Yet Reflected)
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {missingQuestions.map((q) => (
                  <tr key={q.id}>
                    <td>{q.question_text}</td>
                    <td>{q.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Records */}
      {!loading && reportData.length === 0 && missingQuestions.length === 0 && (
        <p className="status-msg no-records">
          No records found for the selected dates and subject.
        </p>
      )}
    </div>
  );
};

export default StudentReport;
