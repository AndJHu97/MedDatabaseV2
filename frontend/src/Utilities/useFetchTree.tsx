import {useEffect, useState} from "react";
import axios from "axios"

interface Node {
    id: number;
    Name: string;
    Notes: string;
    Management: any; // Update with appropriate type if known
    algorithms: Algorithm[];
  }

  interface Disease{
    id: number;
    Name: string;
  }

  interface Algorithm {
    id: number;
    Name: string;
    DiseaseName: string;
    Notes: string | null;
    Disease: number;
    ExamType: number;
    Triggers: any[]; // Update with appropriate type if known
    NextSteps: NextStep[];
  }

  interface NextStep {
    id: number;
    NextStepName: string;
    ConditionsForNextStep: string;
    NumberConditionsForNextStep: number | null;
    OperatorConditionForNumber: string | null;
    NextStepHistoryWorkup: any; // Update with appropriate type if known
    NextStepHistoryAssessment: any; // Update with appropriate type if known
    NextStepVitalWorkup: any; // Update with appropriate type if known
    NextStepVitalAssessment: any; // Update with appropriate type if known
    NextStepPEWorkup: any; // Update with appropriate type if known
    NextStepPEAssessment: any; // Update with appropriate type if known
    NextStepTestWorkup: any; // Update with appropriate type if known
    NextStepTestAssessment: any; // Update with appropriate type if known
    NextStepDiseaseAlgorithm: number | null;
    NextStepDiseaseAssessment: any; // Update with appropriate type if known
    NextStepDiseaseDiagnosis: any; // Update with appropriate type if known
    Symptom: any; // Update with appropriate type if known
    ExamType: number;
  }

export function useFetchTree(disease_index: number){
    const [treeData, setTreeData] = useState<[Disease, Algorithm, Map<number, Algorithm>] | null>(null);
    useEffect(() => {
        const fetchData = async () => {
          try {
            //waits until gets these nodes to run rest
            const response = await axios.get<Node[]>(
              "http://localhost:8000/api/algorithms/"
            );
            const data = response.data;
            
            //get selectedDiseaseTree (default is tree of 0 index)
            //const index = selectedDisease?.Index || 0;
    
            // Convert the array of Algorithm objects to a Map
            const fetchedAlgorithmMap: Map<number, Algorithm> =
            data[disease_index].algorithms.reduce((map, algorithm) => {
                map.set(algorithm.id, algorithm);
                return map;
            }, new Map<number, Algorithm>());
            
              //this will be root node, whose children will be the algorithm
            const fetchedDiseaseNode: Disease = {
              id: data[disease_index].id,
              Name: data[disease_index].Name,
            };

            const diseaseNode = fetchedDiseaseNode;
            const algorithm = data[disease_index].algorithms[0];
            const algorithmMap = fetchedAlgorithmMap;

            //const tree = createTree(diseaseNode, response.data[disease_index].algorithms[0], algorithmMap);
            //setTree(tree);

            setTreeData([diseaseNode, algorithm, algorithmMap]);
    
          } catch (error) {
            console.error("Error getting the disease algorithm tree information:", error);
          }
        };
        console.log("disease_index: " + disease_index);
        fetchData();
      }, [disease_index]);

      return treeData;
    
}