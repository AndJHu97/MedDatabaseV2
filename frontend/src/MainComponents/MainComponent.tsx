import React, { useState } from "react";
import SymptomSelection from "./SymptomSelection";
import SelectedSymptomsDisplay from "./SelectedSymptomsDisplay";
import NextStepsSelections from "./NextStepsSelections";
import FinalResults from "./FinalResults";

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

  const handleRemoveFinalResults = (id: number) => {
    //need to implement
  }

  return (
    <div style={{ position: "relative", width: "80%", paddingTop: "2%", justifyContent: "center", margin: "0 auto" }}>
      <SymptomSelection onSymptomSubmit={handleSymptomSubmit} />
      <br />

      <h4>Symptoms Selected</h4>
      <SelectedSymptomsDisplay
        selectedSymptoms={selectedSymptoms}
        onRemoveSymptom={handleRemoveSelectedSymptom}
      />
      <br></br>
      <NextStepsSelections name = "Next Steps"></NextStepsSelections>
      <br></br>

      <NextStepsSelections name = "Triggers"></NextStepsSelections>
      <br></br>
      <NextStepsSelections name = "Algorithms"></NextStepsSelections>

      <br></br>
      {/* Potential could remove and also make this a next steps selection. However logic could be tricky. 
      Can implement the display of buttons with the next steps though */}
      <FinalResults Result = "Results" onRemoveResults={handleRemoveFinalResults}></FinalResults>
      
    </div>
  );
}
