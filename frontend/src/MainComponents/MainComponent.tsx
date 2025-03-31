import React, { useState, useEffect } from "react";
import SymptomSelection from "./SymptomSelection";
import SelectedSymptomsDisplay from "./SelectedSymptomsDisplay";
import RecommendedStepsSelections from "./RecommendedStepsSelections";
import FinalResults from "./FinalResults";
import axios from 'axios';
import { Button } from "react-bootstrap";
import RecommendedAlgorithms from "./RecommendedAlgorithms";

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

//Add a parent DiseaseAlgorithmTree organized by disease id. Inside, there are all the disease algorithm nodes it goes through
//DiseaseAlgorithmTree should have the selected next steps so it can be kept all in one spot
interface DiseaseAlgorithmNode{
  id: number;
  disease_id: number;
  //the next steps to display
  next_steps: number[];
  //the currently selected next steps
  selected_next_steps: number[];
}

export default function MainComponent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [positiveNextSteps, setPositiveNextSteps] = useState<NextSteps[]>([]);
  const [negativeNextSteps, setNegativeNextSteps] = useState<NextSteps[]>([]);
  const [matchedTriggers, setMatchedTriggers] = useState<TriggerChecklist[]>([]); 
  const [diseaseAlgorithmsInvestigating, setDiseaseAlgorithmsInvestigating] = useState<DiseaseAlgorithmNode[]>([]);

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

  //matching algorithms also trigger the disease algorithms it triggers
  const getMatchingTriggerChecklists = async () => {
    try {

      const symptomIds = selectedSymptoms.map(symptom => symptom.id); 
      const response = await axios.get('http://localhost:8000/api/main/getMatchedDefaultTriggers/', {
        params: { symptom_ids: symptomIds.join(',') }
      });
      console.log("Get matched default triggers: ", response.data);
      setPositiveNextSteps(response.data["positive_next_step_recommendations"]);
      setNegativeNextSteps(response.data["negative_next_step_recommendations"]);
      setMatchedTriggers(response.data["matched_trigger_checklists"]);

      const diseaseAlgorithms: DiseaseAlgorithmNode[] = await Promise.all(
        response.data["diseases_ids_triggered"].map(async (disease_id: number) => {
          // Fetch the disease details
          const disease_response = await axios.get("http://localhost:8000/api/main/showDiseaseById/", {
            params: { id: disease_id },
          });
      
          // Assuming `RootAlgorithmNodes` is an array, get the first element
          const id = disease_response.data.RootAlgorithmNodes[0];
          
          console.log("new algorithm node: ", id);

          // In case the diseaseAlgorithm is already being investigated, find the existing one
          const existingAlgorithm = diseaseAlgorithmsInvestigating.find(alg => alg.id === disease_id);
      
          return {
            id: id,
            disease_id: disease_id,
            // Use existing next steps or else create a new array
            next_steps: existingAlgorithm ? existingAlgorithm.next_steps : [],
            selected_next_steps: existingAlgorithm ? existingAlgorithm.selected_next_steps : [],
          };
        })
      );
      

      setDiseaseAlgorithmsInvestigating(diseaseAlgorithms);

    } catch (error: any) {
      if (error.response) {
        console.error('Error fetching matching trigger checklists:', error.response.data);
      } else if (error.request) {
        console.error('No response received from the server:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    };
  }

  //triggered from matching triggers
  const getDiseaseAlgorithms = async () =>{
    try{

      const updatedAlgorithms = [...diseaseAlgorithmsInvestigating]; // Copy existing state. Prevents infinite loop with set function

      //diseaseAlgorithmInvestigating: Go through the current investigating algorithms and update on next steps
      for(const diseaseAlgorithm of diseaseAlgorithmsInvestigating){
        const disease_algorithm_response = await axios.get('http://localhost:8000/api/main/getDiseaseAlgorithms/',{
          params: {
            disease_id: diseaseAlgorithm.disease_id,
            next_steps_ids: Array.isArray(diseaseAlgorithm.selected_next_steps) ? diseaseAlgorithm.selected_next_steps.join(',') : ''
            }
          }
        );
        
        const updatedId: number = disease_algorithm_response.data["test_id"];
        const updatedNextSteps: number[] = disease_algorithm_response.data["next_steps_ids"];

        //this is if i only want one algorithm for disease
        //const existingAlgorithmIndex = updatedAlgorithms.findIndex(alg => alg.disease_id === diseaseAlgorithm.id);

        const existingAlgorithmIndex = updatedAlgorithms.findIndex(alg => alg.id === updatedId);

        if(existingAlgorithmIndex !== -1){
          updatedAlgorithms[existingAlgorithmIndex].next_steps = updatedNextSteps;
        }else{
          //if id not found, then make new one
            updatedAlgorithms.push({
              id: updatedId,
              disease_id: diseaseAlgorithm.disease_id,
              next_steps: updatedNextSteps,
              //if new nothing selected
              selected_next_steps: []
          });
        }

      }
      return updatedAlgorithms;
    } catch (error: any) {
      console.error('Error fetching disease algorithms: ', error.response.data);
      return [];
    }
  }

  //this activates whenever updating diseaseAlgorithmInvestigating
  useEffect(() => {
    if (diseaseAlgorithmsInvestigating.length > 0) {
      const fetchData = async () => {
        const updatedAlgorithms = await getDiseaseAlgorithms();
         // Compare before setting state to prevent unnecessary updates
        if (JSON.stringify(updatedAlgorithms) !== JSON.stringify(diseaseAlgorithmsInvestigating)) {
          console.log("Disease Algorithms Investigating in Main: ", updatedAlgorithms);
          setDiseaseAlgorithmsInvestigating(updatedAlgorithms);
        }
      };
      fetchData(); // Call the async function inside useEffect
    }
  }, [diseaseAlgorithmsInvestigating]);

  const updatedSelectedNextStep = (diseaseAlgorithmIndex: number, selectedNextStepIDs: number[]) =>{
    console.log("updating selected next steps with ", selectedNextStepIDs);
    setDiseaseAlgorithmsInvestigating((prev) => {
      return prev.map((diseaseAlgorithm, index) =>
      index === diseaseAlgorithmIndex 
      ? {...diseaseAlgorithm, selected_next_steps: selectedNextStepIDs}
    : diseaseAlgorithm);
    });
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
      <RecommendedStepsSelections name = "Positive Next Steps" TriggerNextSteps={positiveNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
      <br></br>
      <RecommendedStepsSelections name = "Negative Next Steps" TriggerNextSteps={negativeNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
      <br></br>
      <RecommendedStepsSelections name = "Triggers"  TriggerNextSteps={null} TriggerChecklists={matchedTriggers}></RecommendedStepsSelections>
      <br></br>
      <RecommendedAlgorithms disease_algorithms={diseaseAlgorithmsInvestigating} updateSelectedNextStepSelection={updatedSelectedNextStep}></RecommendedAlgorithms>
      <br></br>
      {/* Potential could remove and also make this a next steps selection. However logic could be tricky. 
      Can implement the display of buttons with the next steps though */}
      <FinalResults Result = "Results" onRemoveResults={handleRemoveFinalResults}></FinalResults>
      <Button onClick={getMatchingTriggerChecklists}>Submit</Button>
    </div>
  );
}
