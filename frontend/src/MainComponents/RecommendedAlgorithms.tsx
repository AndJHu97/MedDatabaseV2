import React, { useState, useEffect } from "react";
import axios from "axios";
import SelectionButton from "./SelectionButton";
import NextStepSelectionButton from "./NextStepSelectionButton";

interface DiseaseAlgorithm{
  id: number;
  next_steps: number[];
  selected_next_steps: number[];
}

interface RecommendedAlgorithmDataProp {
  disease_algorithms: DiseaseAlgorithm[];
  updateSelectedNextStepSelection: (diseaseAlgorithmIndex: number, selectedNextStepIDs: number[]) => void;
}

interface NextStep{
  id: number;
  ConditionsForNextStep: string;
}

interface DisplayDiseaseAlgorithm{
  id: number;
  name: string;
  notes: string;
  exam_type_id: number;
  diagnosis_id: number;
  next_steps: NextStep[];
  selected_next_steps: NextStep[];
  disease_id: number;
  disease_name: string;
}

export default function RecommendedAlgorithms({ disease_algorithms, updateSelectedNextStepSelection}: RecommendedAlgorithmDataProp) {
  const [areRecommendedStepsVisible, setAreRecommendedStepsVisible] = useState(false);
  const [diseaseAlgorithmInvestigating, setDiseaseAlgorithmsInvestigating] = useState<DisplayDiseaseAlgorithm[]>([]);

  //get all the disease algorithm relevant information into diseaseAlgorithmInvestigating (need to create new interface for them with DisplayDiseaseAlgorithm)
  //display the DisplayDiseaseAlgorithm
  useEffect(() => {
    const fetchDiseaseAlgorithms = async () => {
      try {
        // promise all processes all request until done
        const newDisplayDiseaseAlgorithms = await Promise.all(
          disease_algorithms.map(async (disease_algorithm) => {
            const disease_algorithm_response = await axios.get("http://localhost:8000/api/main/showDiseaseAlgorithms/", {
              params: { id: disease_algorithm.id },
            });

            const disease_response = await axios.get("http://localhost:8000/api/main/showDiseaseById/", {
              params: {id: disease_algorithm_response.data.Disease},
            });

            const next_steps = await Promise.all(
              disease_algorithm.next_steps.map(async (nextStepId) => {
                const next_step_response = await axios.get("http://localhost:8000/api/main/showNextSteps/", {
                  params: { id: nextStepId },
                });
                return next_step_response.data;
              })
            );

            const selected_next_steps = await Promise.all(
              disease_algorithm.selected_next_steps.map(async (selectedNextStepId) => {
                const selected_next_steps_response = await axios.get("http://localhost:8000/api/main/showNextSteps/", {
                  params: { id: selectedNextStepId },
                });
                return selected_next_steps_response.data;
              })
            );

            const displayDiseaseAlgorithm = {
              id: disease_algorithm_response.data.id,
              name: disease_algorithm_response.data.Name,
              notes: disease_algorithm_response.data.Notes, 
              exam_type_id: disease_algorithm_response.data.ExamType, 
              diagnosis_id: disease_algorithm_response.data.Diagnosis, 
              next_steps: next_steps,
              selected_next_steps: selected_next_steps,
              disease_id: disease_algorithm_response.data.Disease, 
              disease_name: disease_response.data.Name
            };

            return displayDiseaseAlgorithm;
          })
        );

        // Update the state with the fetched data
        setDiseaseAlgorithmsInvestigating(newDisplayDiseaseAlgorithms);
      } catch (error) {
        console.error("Error fetching disease algorithms: ", error);
      }
    };

    if(disease_algorithms.length > 0){
      fetchDiseaseAlgorithms();
    }

    fetchDiseaseAlgorithms();
  }, [disease_algorithms]); // Dependency array to run when disease_algorithms changes

  useEffect(() =>{
    console.log("Disease Algorithm Investigating In Recommended Algorithms: ", diseaseAlgorithmInvestigating);
  }, [diseaseAlgorithmInvestigating]);

  

  const toggleRecommendedStepsVisibility = () => {
    setAreRecommendedStepsVisible((prev) => !prev);
  };

  const nextStepButtonSelection = async(nextStepID: number, diseaseAlgorithmIndex: number, isSelected: boolean) =>{
    let currentSelectedNextSteps = diseaseAlgorithmInvestigating[diseaseAlgorithmIndex].selected_next_steps.map(step => step.id);
    console.log("Current selected next steps: ", currentSelectedNextSteps);
    //if selected and selected step does not already have this selected next steps, then add to it
      if(isSelected){
        if(!currentSelectedNextSteps.includes(nextStepID)){
          currentSelectedNextSteps.push(nextStepID);
          updateSelectedNextStepSelection(diseaseAlgorithmIndex, currentSelectedNextSteps);
          console.log(`Next step with id ${nextStepID} added to selected_next_steps`);
      }else{
        console.error("Next step selected is already in selected_next_steps");
      }
    }else{
      if(currentSelectedNextSteps.includes(nextStepID)){
        currentSelectedNextSteps.filter(step => step !== nextStepID);
        updateSelectedNextStepSelection(diseaseAlgorithmIndex, currentSelectedNextSteps);
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
        Suggested Algorithms
        <span style={{ marginLeft: "8px" }}>
          {areRecommendedStepsVisible ? "▲" : "▼"}
        </span>
      </h4>
  
      {areRecommendedStepsVisible && (
        <div className="recommended-steps-choices">
          {Object.entries(
            diseaseAlgorithmInvestigating.reduce((acc, algorithm) => {
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
              {algorithms.map((algorithm, algorithmIndex) => (
                <div key={algorithm.id} style={{ marginLeft: "20px" }}>
                  <h5
                    style={{
                      fontSize: "18px",
                      color: "#555",
                    }}
                    className="algorithm-name"
                  >
                    → Test: {algorithm.name}
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
  
                          return (
                            //Change selection button to be pressed
                            <NextStepSelectionButton
                              key={next_step.id} // Use next_step.id as key
                              nextStepID={next_step.id} // Use next_step.id as id
                              diseaseAlgorithmIndex={algorithmIndex}
                              name={next_step.ConditionsForNextStep} // Use next_step.name as button label
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