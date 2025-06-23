import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NextStepSelectionButton from "./NextStepSelectionButton";
const API_URL = process.env.REACT_APP_API_URL;


interface DiseaseAlgorithmTree{
  disease_id: number;
  selected_next_steps: number[];
  DiseaseAlgorithmNodes: DiseaseAlgorithmNode[];
}

interface DiseaseAlgorithmNode{
  disease_algorithm_id: number;
  //the next steps to display
  next_steps: number[];
}

interface RecommendedAlgorithmDataProp {
  disease_algorithms_trees: DiseaseAlgorithmTree[];
  updateSelectedNextStepSelection: (diseaseAlgorithmIndex: number, selectedNextStepIDs: number[]) => void;

}

interface NextStep{
  id: number;
  ConditionsForNextStep: string;
}

interface DisplayDiseaseAlgorithm{
  algorithm_id: number;
  name: string;
  notes: string;
  exam_type_id: number;
  diagnosis_id: number;
  next_steps: NextStep[];
  selected_next_steps: NextStep[];
  disease_id: number;
  disease_name: string;
  source: string;
}

export default function RecommendedAlgorithms({disease_algorithms_trees, updateSelectedNextStepSelection}: RecommendedAlgorithmDataProp) {
  const [areRecommendedStepsVisible, setAreRecommendedStepsVisible] = useState(true);
  const [diseaseAlgorithmDisplay, setDiseaseAlgorithmDisplay] = useState<DisplayDiseaseAlgorithm[]>([]);
  const prevDiseaseAlgorithmsInvestigatingRef = useRef<DiseaseAlgorithmTree[]>([]);
  
  //get all the disease algorithm relevant information into diseaseAlgorithmInvestigating (need to create new interface for them with DisplayDiseaseAlgorithm)
  //display the DisplayDiseaseAlgorithm
  useEffect(() => {
    const fetchDiseaseAlgorithms = async () => {

      //Disease Algorithm Trees structure: 
        //Disease being investigated: Test (Algorithm Node) and Selected next steps
          //Test (Algorithm Node): Selection of next steps to choose from, ID
      if (!disease_algorithms_trees || !Array.isArray(disease_algorithms_trees)) {
        console.error("disease_algorithms_tree is not an array", disease_algorithms_trees);
        return;
      }
      
      //Make the structure to display
      try {
        const newDisplayDiseaseAlgorithms = [];
        //Goes through each disease id
        for (let index = 0; index < disease_algorithms_trees.length; index++) {
          const disease_algorithms_tree = disease_algorithms_trees[index];


          //if the tree hasn't changed, then keep the same displays
          if(prevDiseaseAlgorithmsInvestigatingRef.current.some(prev => 
            JSON.stringify(prev) === JSON.stringify(disease_algorithms_tree)
          ))
          {

            //Get the existing display and continue (don't fetch again to speed things up)
            const already_processed_disease_id = disease_algorithms_tree.disease_id;
            const already_processed_displays = diseaseAlgorithmDisplay.filter(display => 
              display.disease_id === already_processed_disease_id);

            newDisplayDiseaseAlgorithms.push(...already_processed_displays);
            
            continue;
          }

          //Goes through each test/nodes
          const diseaseAlgorithmNodes = Array.isArray(disease_algorithms_tree.DiseaseAlgorithmNodes)
            ? disease_algorithms_tree.DiseaseAlgorithmNodes
            : [];
          

          //get each test/node data
          const nodesData = await Promise.all(
            diseaseAlgorithmNodes.map(async (disease_algorithm_node) => {
  
              const disease_algorithm_response = await axios.get("http://localhost:8000/api/main/showDiseaseAlgorithms/", {
                params: { id: disease_algorithm_node.disease_algorithm_id },
              });
  
              const disease_response = await axios.get("http://localhost:8000/api/main/showDiseaseById/", {
                params: { id: disease_algorithm_response.data.Disease },
              });
  
              const next_steps = await Promise.all(
                disease_algorithm_node.next_steps.map(async (nextStepId) => {
                  const next_step_response = await axios.get("http://localhost:8000/api/main/showNextSteps/", {
                    params: { id: nextStepId },
                  });
                  return next_step_response.data;
                })
              );
  
              const selected_next_steps = await Promise.all(
                (disease_algorithms_tree.selected_next_steps ?? []).map(async (selectedNextStepId) => {
                  const selected_next_steps_response = await axios.get("http://localhost:8000/api/main/showNextSteps/", {
                    params: { id: selectedNextStepId },
                  });
                  return selected_next_steps_response.data;
                })
              );
  
              return {
                algorithm_id: disease_algorithm_response.data.id,
                name: disease_algorithm_response.data.Name,
                notes: disease_algorithm_response.data.Notes,
                exam_type_id: disease_algorithm_response.data.ExamType,
                diagnosis_id: disease_algorithm_response.data.Diagnosis,
                next_steps: next_steps,
                selected_next_steps: selected_next_steps,
                disease_id: disease_algorithm_response.data.Disease,
                disease_name: disease_response.data.Name,
                source: disease_algorithm_response.data.Source
              };
            })
          );
  
          newDisplayDiseaseAlgorithms.push(...nodesData); // Add results to the main array
        }
  
        console.log("New display algorithm: ", newDisplayDiseaseAlgorithms);
        setDiseaseAlgorithmDisplay(newDisplayDiseaseAlgorithms);
        //Set to compare next time to not repeat the newDisplayDiseaseAlgorithms
        prevDiseaseAlgorithmsInvestigatingRef.current = disease_algorithms_trees;
      } catch (error) {
        console.error("Error fetching disease algorithms: ", error);
      }
    };
  
    fetchDiseaseAlgorithms();
  }, [disease_algorithms_trees]); // Dependency array to run when disease_algorithms changes
  

  const toggleRecommendedStepsVisibility = () => {
    setAreRecommendedStepsVisible((prev) => !prev);
  };

  const nextStepButtonSelection = async(nextStepID: number, diseaseID: number, isSelected: boolean) =>{
    //was doing this by reference at first and so didn't work (made things worked out of order in MainComponents)
    const copy_disease_algorithms_trees = structuredClone(disease_algorithms_trees);

    const selectedDiseaseAlgorithmTree = copy_disease_algorithms_trees.find(tree => tree.disease_id === diseaseID);
    let currentSelectedNextSteps = selectedDiseaseAlgorithmTree?.selected_next_steps ?? [];
    //console.log("Current selected next steps before altering: ", currentSelectedNextSteps);
    //if selected and selected step does not already have this selected next steps, then add to it
      if(isSelected){
        if(!currentSelectedNextSteps.includes(nextStepID)){
          currentSelectedNextSteps.push(nextStepID);
          updateSelectedNextStepSelection(diseaseID, currentSelectedNextSteps);
          console.log(`Next step with id ${nextStepID} added to selected_next_steps`);
      }else{
        console.error("Next step selected is already in selected_next_steps");
      }
    }else{
      if(currentSelectedNextSteps.includes(nextStepID)){
        currentSelectedNextSteps = currentSelectedNextSteps.filter(step => step !== nextStepID);
        console.log("Removing next step and updated current selected next steps: ", currentSelectedNextSteps);
        updateSelectedNextStepSelection(diseaseID, currentSelectedNextSteps);
        console.log(`Next step with id ${nextStepID} removed from selected_next_steps`);
      }else{
        console.error("Next step deselected not in selected_next_steps");
      }
    }
  };

  return (
    <div>
      <h4
        onClick={toggleRecommendedStepsVisibility}
        style={{ display: "flex", alignItems: "center", userSelect: "none" }}
      >
        2. Suspected Disease Diagnostic Workflow
        <span style={{ marginLeft: "8px" }}>
          {areRecommendedStepsVisible ? "▲" : "▼"}
        </span>
      </h4>
  
      {areRecommendedStepsVisible && (
        <div className="recommended-steps-choices">
          {Object.entries(
            diseaseAlgorithmDisplay.reduce((acc, algorithm) => {
              if (!acc[algorithm.disease_name]) acc[algorithm.disease_name] = [];
              acc[algorithm.disease_name].push(algorithm);
              return acc;
            }, {} as Record<string, DisplayDiseaseAlgorithm[]>)
          ).map(([diseaseName, algorithms]) => (
            <div key={diseaseName}>
              <h4
                style={{
                  color: "#007BFF",
                  fontSize: "22px",
                  marginBottom: "8px",
                }}
                className="disease-name"
              >
                {diseaseName}
              </h4>
              {algorithms.map((algorithm, index) => (
                <div key={algorithm.algorithm_id} style={{ marginLeft: "20px" }}>
                  <h5
                    style={{
                      fontSize: "18px",
                      color: "#555",
                    }}
                    className="algorithm-name"
                  >
                    <a href={algorithm.source} target="_blank" rel="noopener noreferrer">
                    → Test: {algorithm.name}
                    </a>
                  </h5>
  
                  {/* Next Steps Section */}
                  {algorithm.next_steps.length > 0 && (
                    <div style={{ marginLeft: "40px", marginTop: "8px" }}>
                      <h6
                        style={{
                          fontSize: "16px",
                          color: "#777",
                          marginBottom: "5px",
                        }}
                      >
                        Choose a Result:
                      </h6>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {algorithm.next_steps.map((next_step) => {
                          //check if it is selected
                          const isSelected = algorithm.selected_next_steps.some(
                            (selectedStep) => selectedStep.id === next_step.id
                          );

                          //check if this last and second to last disease node (can only be selectable if it has already been selected) so only those can be edited
                          var isSelectable = false;
                          if((index == algorithms.length - 2 && isSelected) || index == algorithms.length - 1 || algorithms.length == 1){
                            isSelectable = true;
                          }
  
                          return (
                            //Change selection button to be pressed
                            <NextStepSelectionButton
                              key={next_step.id} // Use next_step.id as key
                              nextStepID={next_step.id} // Use next_step.id as id
                              diseaseID={algorithm.disease_id}
                              name={next_step.ConditionsForNextStep} // Use next_step.name as button label
                              isSelectable = {isSelectable}
                              onSelection={nextStepButtonSelection}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}  