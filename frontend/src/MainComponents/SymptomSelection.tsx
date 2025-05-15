import React, { useEffect, useState } from "react";
import axios from "axios";

interface Symptom {
  id: number;
  Name: string;
  ExamType: number;
}

interface ExamType {
  id: number;
  Name: string;
}

interface SymptomSelectionProps {
  onSymptomSubmit: (selectedSymptom: Symptom | null) => void;
}

export default function SymptomSelection({ onSymptomSubmit }: SymptomSelectionProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);

  // Fetch Symptoms and ExamTypes
  useEffect(() => {
    axios.get("http://localhost:8000/api/main/showSymptoms/")
      .then((response) => {
        setSymptoms(response.data);
        setFilteredSymptoms(response.data);
      })
      .catch((error) => console.error(error));

    axios.get("http://localhost:8000/api/main/showExamTypes/")
      .then((response) => {
        setExamTypes(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  // Filter symptoms when searchTerm or selectedExamType changes
  useEffect(() => {
    const filtered = symptoms.filter(symptom =>
      symptom.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedExamType === null || symptom.ExamType === selectedExamType.id)
    );
    setFilteredSymptoms(filtered);
  }, [searchTerm, selectedExamType, symptoms]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowDropdown(true);
  };

  const handleSymptomSelect = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setSearchTerm(symptom.Name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    onSymptomSubmit(selectedSymptom);
  };

  const handleExamTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    if (isNaN(selectedId)) {
      setSelectedExamType(null);
    } else {
      const selected = examTypes.find(et => et.id === selectedId) || null;
      setSelectedExamType(selected);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <h4>Select a Symptom</h4>

      {/* Flex container for ExamType dropdown and search input */}
      <div style={{ display: "flex", gap: "8px" }}>
        {/* ExamType Dropdown */}
        <select
          value={selectedExamType ? selectedExamType.id : ""}
          onChange={handleExamTypeChange}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            minWidth: "120px",
          }}
        >
          <option value="">All Exams</option>
          {examTypes.map((examType) => (
            <option key={examType.id} value={examType.id}>
              {examType.Name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search or select a symptom..."
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          {showDropdown && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                listStyle: "none",
                padding: "0",
                margin: "0",
                zIndex: 1000,
              }}
            >
              {filteredSymptoms.length > 0 ? (
                filteredSymptoms.map((symptom) => (
                  <li
                    key={symptom.id}
                    onClick={() => handleSymptomSelect(symptom)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {symptom.Name}
                  </li>
                ))
              ) : (
                <li style={{ padding: "8px", textAlign: "center", color: "#888" }}>
                  No symptoms found
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "block",
          width: "100%",
        }}
      >
        Submit
      </button>
    </div>
  );
}
