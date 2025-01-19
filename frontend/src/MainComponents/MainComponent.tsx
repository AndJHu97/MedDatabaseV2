import React, { useState } from "react";
import SymptomSelection from "./SymptomSelection";
import SelectedSymptomsDisplay from "./SelectedSymptomsDisplay";
import NextStepsSelections from "./NextStepsSelections";
import FinalResults from "./FinalResults";
import axios from 'axios';
import { Button } from "react-bootstrap";

interface Symptom {
  id: number;
  Name: string;
}

export default function MainComponent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  // Example usage
  const symptomIds = [1, 2, 3, 30];
  const handleSymptomSubmit = (symptom: Symptom | null) => {
    //check if the symptom isn't selected yet
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

  const getMatchingTriggerChecklists = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/trigger/getMatchedDefaultTriggers/', {
        symptom_ids: symptomIds,
      });
      console.log(response.data);
      return response.data; // This contains the matching checklists
    } catch (error: any) {
      console.error('Error fetching matching trigger checklists:', error.response.data);
      return [];
    }
  };


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
      <Button onClick={getMatchingTriggerChecklists}>Test the matched triggerChecklists</Button>
    </div>
  );
}
