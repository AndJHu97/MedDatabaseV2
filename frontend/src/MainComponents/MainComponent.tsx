import React, { useState, useRef, useEffect } from "react";
import SymptomSelection from "./SymptomSelection";
import SelectedSymptomsDisplay from "./SelectedSymptomsDisplay";
import RecommendedStepsSelections from "./RecommendedStepsSelections";
import FinalResults from "./FinalResults";
import axios from 'axios';
import RecommendedAlgorithms from "./RecommendedAlgorithms";
import {SymptomsContext} from "./Context/SymptomContext";
const API_URL = process.env.REACT_APP_API_URL;

interface Symptom {
  id: number;
  Name: string;
}

interface NextSteps{
  symptom_id: number;
  trigger_name: string;
  source: string;
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
interface DiseaseAlgorithmTree{
  disease_id: number;
  selected_next_steps: number[];
  DiseaseAlgorithmNodes: DiseaseAlgorithmNode[];
}


//DiseaseAlgorithmTree should have the selected next steps so it can be kept all in one spot
interface DiseaseAlgorithmNode{
  disease_algorithm_id: number;
  //the next steps to display
  next_steps: number[];
}

export default function MainComponent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [positiveNextSteps, setPositiveNextSteps] = useState<NextSteps[]>([]);
  const [negativeNextSteps, setNegativeNextSteps] = useState<NextSteps[]>([]);
  const [matchedTriggers, setMatchedTriggers] = useState<TriggerChecklist[]>([]); 
  const [diseaseAlgorithmsInvestigating, setDiseaseAlgorithmsInvestigating] = useState<DiseaseAlgorithmTree[]>([]);
  const prevDiseaseAlgorithmsInvestigatingRef = useRef<DiseaseAlgorithmTree[]>([]);

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
      //Make sure it doesn't trigger error
      const symptomIds = selectedSymptoms.map(symptom => symptom.id); 
      const matched_triggers_response = await axios.get(`${API_URL}/api/main/getMatchedDefaultTriggers/`, {
        params: { symptom_ids: symptomIds.join(',') }
      });
      //console.log("Get matched default triggers: ", response.data);
      setPositiveNextSteps(matched_triggers_response.data["positive_next_step_recommendations"]);
      setNegativeNextSteps(matched_triggers_response.data["negative_next_step_recommendations"]);

      setMatchedTriggers(matched_triggers_response.data["matched_trigger_checklists"]);


      //if the diseases triggered are already being investigated, don't search through them
      const investigatingDiseaseIds = diseaseAlgorithmsInvestigating.map(alg => alg.disease_id).sort();
      const newTriggeredDiseaseIds = matched_triggers_response.data["diseases_ids_triggered"].slice().sort();
      console.log("Updated diseases triggered: ", newTriggeredDiseaseIds);
      if (JSON.stringify(investigatingDiseaseIds) === JSON.stringify(newTriggeredDiseaseIds)) {
        console.log("Same diseases already being investigated. Skipping update.");
        return;
      }

      //If new disease trigered, then investigate through them.  

      //if triggered any of the disease, then start the algorithms
      const diseaseAlgorithms: DiseaseAlgorithmTree[] = await Promise.all(
        matched_triggers_response.data["diseases_ids_triggered"].map(async (disease_id: number) => {
          // Fetch the disease details
          const disease_response = await axios.get(`${API_URL}/api/main/showDiseaseById/`, {
            params: { id: disease_id },
          });
      
          // Assuming `RootAlgorithmNodes` is an array, get the first element. (This assumes there is only one root algorithm)
          const root_algorithm_node_id = disease_response.data.RootAlgorithmNodes[0];
          
          //console.log("new algorithm node: ", root_algorithm_node_id);

          //check if this disease is already being investigated
          const existingAlgorithmTree = diseaseAlgorithmsInvestigating.find(alg => alg.disease_id === disease_id);

          const newRootAlgorithmNode: DiseaseAlgorithmNode = {
            disease_algorithm_id: root_algorithm_node_id,
            //set this to none for now because getDiseaseAlgorithms will populate this
            next_steps: []
          };

          if(existingAlgorithmTree){
            //if algorithn tree exist but doesn't have this node, then need to add
            if(!existingAlgorithmTree.DiseaseAlgorithmNodes.find(node => node.disease_algorithm_id === root_algorithm_node_id)){
              existingAlgorithmTree.DiseaseAlgorithmNodes.push(newRootAlgorithmNode);
            }
          }
      
          return {
          
            disease_id: disease_id,
            //next_steps: existingAlgorithm ? existingAlgorithm.next_steps : [],
            selected_next_steps: existingAlgorithmTree ? existingAlgorithmTree.selected_next_steps : [],
            DiseaseAlgorithmNodes: existingAlgorithmTree ? existingAlgorithmTree.DiseaseAlgorithmNodes : [newRootAlgorithmNode]
          };
        })
      );
      
      console.log("Setting disease algorithm in matching triggers ", diseaseAlgorithms);
      //set all the triggered algorithms (doesn't include next steps)
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

      //deep copy because before i was doing shallow copy (still referencing) and would change the diseaseAlgorithmsInvestigating without triggering re-render
      //Deep copy makes it so I don't change the diseaseAlgorithmIvestigating and later in code I can setDiseaseAlgorithmInvestigating for a re-render
      //filter out anything already being investigated so it doesn't do it again. 
      const updatedAlgorithmTree = structuredClone(diseaseAlgorithmsInvestigating);
  
      //diseaseAlgorithmInvestigating: Go through the current investigating algorithms and update on next steps
      for(const diseaseAlgorithmTree of updatedAlgorithmTree){
        //Check to make sure only go through disease algorithms if the current selected next steps have changed
        if(!prevDiseaseAlgorithmsInvestigatingRef.current.some(
            (prev) => JSON.stringify(prev) === JSON.stringify(diseaseAlgorithmTree)))
          {
            const disease_algorithm_response = await axios.get(`${API_URL}/api/main/getDiseaseAlgorithms/`,{
              params: {
                disease_id: diseaseAlgorithmTree.disease_id,
                next_steps_ids: Array.isArray(diseaseAlgorithmTree.selected_next_steps) ? diseaseAlgorithmTree.selected_next_steps.join(',') : ''
                }
              }
            );
            
            //test is the node
            const updated_disease_algorithm_ID: number = disease_algorithm_response.data["test_id"];
            //next steps are the links
            const updated_next_steps_ids: number[] = disease_algorithm_response.data["next_steps_ids"];
    
            //this is if i only want one algorithm tree for disease
    
            // 1. Find the disease of the tree
            // 2. Find the index of node of the tree to see if it exists
    
            const existingDiseaseAlgorithmNodes = diseaseAlgorithmTree.DiseaseAlgorithmNodes ?? [];
    
            const existingAlgorithmNodeIndex = existingDiseaseAlgorithmNodes.findIndex(alg => alg.disease_algorithm_id === updated_disease_algorithm_ID);
            //get the index of the diseaseTreeIndex
            const diseaseTreeIndex = updatedAlgorithmTree.findIndex(alg => alg.disease_id === diseaseAlgorithmTree.disease_id);
    
            
            //if node of tree does exist. I think this parts only adds the next steps (since some disease triggered does not have next steps available)
            if(existingAlgorithmNodeIndex !== -1){
              console.log("Algorithm index: ", existingAlgorithmNodeIndex);
              //Take out disease algorithm nodes no longer relevant
              //1. Since updated disease alg ID is in the existing disease algorithm nodes, then you aren't adding new alg. You're taking away an alg
              //2. Take out any nodes after index of the updated disease alg ID
              //this only works if this is a pass by reference
              const existingDiseaseAlgorithmNodes = updatedAlgorithmTree[diseaseTreeIndex].DiseaseAlgorithmNodes;

              updatedAlgorithmTree[diseaseTreeIndex].DiseaseAlgorithmNodes = existingDiseaseAlgorithmNodes.filter((_,index) => 
                index <= existingAlgorithmNodeIndex
              ); 
              
              existingDiseaseAlgorithmNodes[existingAlgorithmNodeIndex].next_steps = updated_next_steps_ids;
              //if id not found, then make new one
            }else{
              // Ensure DiseaseAlgorithmNodes is initialized before pushing
              if (!updatedAlgorithmTree[diseaseTreeIndex].DiseaseAlgorithmNodes) {
                updatedAlgorithmTree[diseaseTreeIndex].DiseaseAlgorithmNodes = [];
              }
                
                updatedAlgorithmTree[diseaseTreeIndex].DiseaseAlgorithmNodes.push({
                  disease_algorithm_id: updated_disease_algorithm_ID,
                  next_steps: updated_next_steps_ids,
                });
            }
          }
            // means it's already in prev
          }
          
       
      console.log("Updated algorithm tree: ", updatedAlgorithmTree);
        //Find the algorithm trees


      return updatedAlgorithmTree;
    } catch (error: any) {
      console.error('Error fetching disease algorithms: ', error.response.data);
      return [];
    }
  }

  useEffect(() =>{
    getMatchingTriggerChecklists();
  }, [selectedSymptoms])

  useEffect(() =>{
    console.log("prev diseaseAlgorithm ref: ", JSON.parse(JSON.stringify(prevDiseaseAlgorithmsInvestigatingRef.current)), " current ", JSON.parse(JSON.stringify(diseaseAlgorithmsInvestigating)));
  }, [diseaseAlgorithmsInvestigating])

  //this activates whenever updating diseaseAlgorithmInvestigating
  useEffect(() => {
    //console.log("Current disease algorithms investigating: ", previousAlgorithmsTrees);
    if (diseaseAlgorithmsInvestigating.length > 0 || prevDiseaseAlgorithmsInvestigatingRef.current.length > 0) {
      const fetchData = async () => {
        const updatedAlgorithmsTrees = await getDiseaseAlgorithms();
         // Compare before setting state to prevent unnecessary updates
         console.log("Current disease algorithms investigating: ", JSON.parse(JSON.stringify(diseaseAlgorithmsInvestigating)));
        if (JSON.stringify(updatedAlgorithmsTrees) != JSON.stringify(diseaseAlgorithmsInvestigating)) {
          console.log("Disease Algorithms Investigating in Main: ", updatedAlgorithmsTrees);
          setDiseaseAlgorithmsInvestigating(updatedAlgorithmsTrees);
          prevDiseaseAlgorithmsInvestigatingRef.current = updatedAlgorithmsTrees;
        }
      };
      fetchData(); // Call the async function inside useEffect
    }
  }, [diseaseAlgorithmsInvestigating]);

  //when click through the next steps
  const updatedSelectedNextStep = (diseaseID: number, selectedNextStepIDs: number[]) =>{
    const prevSnapshot = structuredClone(diseaseAlgorithmsInvestigating);
    prevDiseaseAlgorithmsInvestigatingRef.current = prevSnapshot;

    console.log("Disease Tree prev snapshot: ", JSON.stringify(prevSnapshot));
    console.log("Disease tree before next step button: ", JSON.stringify(diseaseAlgorithmsInvestigating));


    setDiseaseAlgorithmsInvestigating((prev) => {
      return prev.map((diseaseAlgorithmTree) =>
      diseaseAlgorithmTree.disease_id === diseaseID 
      ? {...diseaseAlgorithmTree, selected_next_steps: selectedNextStepIDs}
    : diseaseAlgorithmTree);
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
      <SymptomsContext.Provider value = {{selectedSymptoms, setSelectedSymptoms}}>
        <RecommendedStepsSelections name = "1a. Symptoms to Rule In" TriggerNextSteps={positiveNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
        <br></br>
        <RecommendedStepsSelections name = "1b. Symptoms to Rule Out" TriggerNextSteps={negativeNextSteps} TriggerChecklists={null}></RecommendedStepsSelections>
        <br></br>
        <RecommendedStepsSelections name = "Recommended Diseases to Investigate"  TriggerNextSteps={null} TriggerChecklists={matchedTriggers}></RecommendedStepsSelections>
        <br></br>
      </SymptomsContext.Provider>
      <RecommendedAlgorithms disease_algorithms_trees={diseaseAlgorithmsInvestigating} updateSelectedNextStepSelection={updatedSelectedNextStep} ></RecommendedAlgorithms>
      <br></br>
      {/* Potential could remove and also make this a next steps selection. However logic could be tricky. 
      Can implement the display of buttons with the next steps though */}
      <FinalResults Result = "Results" onRemoveResults={handleRemoveFinalResults}></FinalResults>
    </div>
  );
}
