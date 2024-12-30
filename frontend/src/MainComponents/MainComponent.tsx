import React, { useEffect, useState } from "react";
import axios from "axios";

interface Symptom {
  id: number;
  Name: string;
}

export default function MainComponent() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);

  // Fetch Symptoms for user input
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/trigger/showSymptoms/")
      .then((response) => {
        setSymptoms(response.data);
        setFilteredSymptoms(response.data); // Initialize filteredSymptoms
      })
      .catch((error) => console.error(error));
  }, []);

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setShowDropdown(true);

    // Filter symptoms based on the search in input textbox
    setFilteredSymptoms(
      symptoms.filter((symptom) =>
        symptom.Name.toLowerCase().includes(searchValue)
      )
    );
  };

  // Handle symptom dropdown selection. Automatically sets the search textbox
  const handleSymptomSelect = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setSearchTerm(symptom.Name); // Update the input field to show the selected symptom
    setShowDropdown(false); // Close the dropdown
  };

  return (
    <div style={{ position: "relative", width: "300px", margin: "0 auto" }}>
        <h4>Select a Symptom</h4>
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
  );
}
