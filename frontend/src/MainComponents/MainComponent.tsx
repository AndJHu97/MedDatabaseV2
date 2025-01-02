import React, { useState } from "react";
import SymptomSelection from "./SymptomSelection";
import SelectedSymptomsDisplay from "./SelectedSymptomsDisplay";

interface Symptom {
  id: number;
  Name: string;
}

export default function MainComponent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);

  const handleSymptomSubmit = (symptom: Symptom | null) => {
    if (symptom && !selectedSymptoms.some((s) => s.id === symptom.id)) {
      setSelectedSymptoms((prev) => [...prev, symptom]);
    }
  };

  const handleRemoveSelectedSymptom = (id: number) => {
    setSelectedSymptoms((prev) => prev.filter((symptom) => symptom.id !== id));
  };

  return (
    <div style={{ position: "relative", width: "300px", margin: "0 auto" }}>
      <SymptomSelection onSymptomSubmit={handleSymptomSubmit} />
      <br />

      <h4>Symptoms Selected</h4>
      <SelectedSymptomsDisplay
        selectedSymptoms={selectedSymptoms}
        onRemoveSymptom={handleRemoveSelectedSymptom}
      />
    </div>
  );
}
