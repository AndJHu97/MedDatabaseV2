import React from "react";

interface Symptom {
  id: number;
  Name: string;
}

interface SelectedSymptomsDisplayProps {
  selectedSymptoms: Symptom[];
  onRemoveSymptom: (id: number) => void;
}

const SelectedSymptomsDisplay: React.FC<SelectedSymptomsDisplayProps> = ({
  selectedSymptoms,
  onRemoveSymptom,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "10px",
        padding: "5px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
      }}
    >
      {selectedSymptoms.map((symptom) => (
        <div
          key={symptom.id}
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#007BFF",
            color: "white",
            borderRadius: "16px",
            padding: "4px 8px",
          }}
        >
          <span>{symptom.Name}</span>
          <button
            onClick={() => onRemoveSymptom(symptom.id)}
            style={{
              marginLeft: "8px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectedSymptomsDisplay;
