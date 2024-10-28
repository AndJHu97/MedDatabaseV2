import React, { useState, useEffect } from 'react';
import {useFetchDiseaseSelection} from "../Utilities/useFetchDiseaseSelection";
interface PreselectedInputs {
    id: number;
    Index: number;
    Name: string;
  }

  interface DiseaseDropdownSelection{
    onDiseaseSelectionChange: (newSelectedDisease: PreselectedInputs | undefined) => void;
    onUpdate: boolean;
  }

export default function DiseaseDropdownSelection({onDiseaseSelectionChange, onUpdate}: DiseaseDropdownSelection)
{
    const [selectedDisease, setSelectedDisease] = useState<PreselectedInputs | null>();
    //const [diseaseOptions, setDiseaseOptions] = useState<PreselectedInputs[]>([]);

    const diseaseOptions = useFetchDiseaseSelection(onUpdate);
    /*
    useEffect(() =>{
        
        setDiseaseOptions(diseaseData);
        console.log("update dropdown: " + onUpdate);
    }, [onUpdate])
    */
    const handleDiseaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selectedDisease = diseaseOptions.find(disease => disease.id === selectedId);
        setSelectedDisease(selectedDisease);
        onDiseaseSelectionChange(selectedDisease);
    };
    return(
        <div className="mb-3">
        <label htmlFor="diseaseSelect" className="form-label">Select Disease:</label>
        <select
          className="form-control"
          id="diseaseAlg"
          name={selectedDisease?.Name}
          value={selectedDisease?.id}
          onChange={handleDiseaseSelect}
        >
          <option value="">Select a Disease</option>
          {diseaseOptions.map((disease) => (
            <option key={disease.id} value={disease.id}>
              {disease.Name}
            </option>
          ))}
        </select>
        </div>
    )
}