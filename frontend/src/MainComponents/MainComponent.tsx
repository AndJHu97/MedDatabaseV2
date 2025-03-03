import React, { useState } from "react";
import SymptomSelection from "./SymptomSelection";
import SelectedSymptomsDisplay from "./SelectedSymptomsDisplay";
import RecommendedStepsSelections from "./RecommendedStepsSelections";
import FinalResults from "./FinalResults";
import axios from 'axios';
import { Button } from "react-bootstrap";

interface Symptom {
  id: number;
  Name: string;
}

interface NextSteps{
  symptom_id: number;
  trigger_name: string;
}

interface TriggerChecklist {
  id: number;
  Name: string | null;
  Group: string;
  PositiveSymptoms: Symptom[];
  NegativeSymptoms: Symptom[];
  MandatoryPositiveSymptoms: Symptom[];
  MandatoryNegativeSymptoms: Symptom[];
  ChecklistLogic: string | null;
  SelectionType: string | null; // Assuming SelectionType is a string
  SelectionAdditionalInfo: string | null;
  GeneralAdditionalInfo: string | null;
  Disease: number | null;
}

export default function MainComponent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [positiveNextSteps, setPositiveNextSteps] = useState<NextSteps[]>([]);
  const [negativeNextSteps, setNegativeNextSteps] = useState<NextSteps[]>([]);
  const [matchedTriggers, setMatchedTriggers] = useState<TriggerChecklist[]>([]); 

  // Example usage
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

      const symptomIds = selectedSymptoms.map(symptom => symptom.id); // Extract IDs
      const response = await axios.post('http://localhost:8000/api/main/getMatchedDefaultTriggers/', {
        symptom_ids: symptomIds,
      });
      console.log(response.data);
      setPositiveNextSteps(response.data["positive_next_step_recommendations"]);
      setNegativeNextSteps(response.data["negative_next_step_recommendations"]);
      setMatchedTriggers(response.data["matched_trigger_checklists"]);
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
      <RecommendedStepsSelections name = "Positive Next Steps" NextSteps={positiveNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
      <br></br>
      <RecommendedStepsSelections name = "Negative Next Steps" NextSteps={negativeNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
      <br></br>
      <RecommendedStepsSelections name = "Triggers"  NextSteps={null} TriggerChecklists={matchedTriggers}></RecommendedStepsSelections>
      <br></br>
      <RecommendedStepsSelections name = "Algorithms"  NextSteps={positiveNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
      <br></br>
      {/* Potential could remove and also make this a next steps selection. However logic could be tricky. 
      Can implement the display of buttons with the next steps though */}
      <FinalResults Result = "Results" onRemoveResults={handleRemoveFinalResults}></FinalResults>
      <Button onClick={getMatchingTriggerChecklists}>Test the matched triggerChecklists</Button>
    </div>
  );
}
