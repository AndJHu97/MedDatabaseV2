import React from "react";
import SelectionButton from "./SelectionButton";

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
        <SelectionButton name = {symptom.Name} id = {symptom.id} onRemoveSelection={onRemoveSymptom} key = {symptom.id}></SelectionButton>
      ))}
    </div>
  );
};

export default SelectedSymptomsDisplay;
