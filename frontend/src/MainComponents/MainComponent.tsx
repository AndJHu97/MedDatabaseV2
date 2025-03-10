import React, { useState, useEffect } from "react";
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

interface DiseaseAlgorithm{
  id: number;
  next_steps: number[];
}

export default function MainComponent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [positiveNextSteps, setPositiveNextSteps] = useState<NextSteps[]>([]);
  const [negativeNextSteps, setNegativeNextSteps] = useState<NextSteps[]>([]);
  const [matchedTriggers, setMatchedTriggers] = useState<TriggerChecklist[]>([]); 
  const [diseaseAlgorithmsTriggered, setDiseaseAlgorithmsTriggered] = useState<DiseaseAlgorithm[]>([]);

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

      const symptomIds = selectedSymptoms.map(symptom => symptom.id); 
      const response = await axios.get('http://localhost:8000/api/main/getMatchedDefaultTriggers/', {
        params: { symptom_ids: symptomIds.join(',') }
      });
      console.log(response.data);
      setPositiveNextSteps(response.data["positive_next_step_recommendations"]);
      setNegativeNextSteps(response.data["negative_next_step_recommendations"]);
      setMatchedTriggers(response.data["matched_trigger_checklists"]);

      const diseaseAlgorithms: DiseaseAlgorithm[] = response.data["diseases_ids_triggered"].map((id: number) => ({
        id: id,
        next_steps: [] //set empty
      }));

      setDiseaseAlgorithmsTriggered(diseaseAlgorithms);

    } catch (error: any) {
      console.error('Error fetching matching trigger checklists:', error.response.data);
      return [];
    }
  };

  const getDiseaseAlgorithms = async () =>{
    try{
      for(const diseaseAlgorithm of diseaseAlgorithmsTriggered){
        const response = await axios.get('http://localhost:8000/api/main/getDiseaseAlgorithms/',{
          params: {
            disease_id: diseaseAlgorithm.id,
            next_steps_ids: diseaseAlgorithm.next_steps
            }
          }
        );
        console.log(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching disease algorithms: ', error.response.data);
      return [];
    }
  }

  useEffect(() => {
    if (diseaseAlgorithmsTriggered.length > 0){
      getDiseaseAlgorithms();
    } 
  }, [diseaseAlgorithmsTriggered])


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
