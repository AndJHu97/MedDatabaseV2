import {useEffect, useState} from "react";
import axios from "axios"

interface PreselectedInputs {
    id: number;
    Index: number;
    Name: string;
  }

  interface Node {
    id: number;
    Name: string;
    Notes: string;
    Management: any; // Update with appropriate type if known
    algorithms: Algorithm[];
  }
 

export function useFetchDiseaseSelection(){
    const [diseaseAlg, setDiseaseAlg] = useState<PreselectedInputs[]>([]);
  //This is for selecting a disease tree
  useEffect(() => {
    const fetchData = async () => {
      try {
        //waits until gets these nodes to run rest
        const response = await axios.get<Node[]>(
          "http://localhost:8000/api/algorithms/"
        );
        //set the disease information. Note, second parameter of callback is index automatically for map
        const diseaseData = response.data.map((disease: any, index: number) => ({
          id: disease.id,
          Index: index,
          Name: disease.Name
        }
      ));

        setDiseaseAlg(diseaseData);

      } catch (error) {
        console.error("Error getting the disease algorithm tree information:", error);
      }
    };
    fetchData();
  }, []);

  return diseaseAlg;
}