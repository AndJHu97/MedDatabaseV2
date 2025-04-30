import {useContext} from "react"
import { SymptomsContext } from "./Context/SymptomContext";

interface SelectionButtonProps{
    name: string;
    id: number;
    isSymptomSelectable: boolean;
    onRemoveSelection: (id: number) => void;
}

interface Symptom {
  id: number;
  Name: string;
}

export default function SelectionButton({name, id, isSymptomSelectable, onRemoveSelection}: SelectionButtonProps){
  
  const { setSelectedSymptoms } = useContext(SymptomsContext);
  const addSymptom = () =>{
    setSelectedSymptoms((prev: Symptom[]) => {
      if (prev.some(symptom => symptom.id === id)) return prev;
      return [...prev, { id, Name: name }];

    })
  }
  
  return(
        <div
          key={id}
          onClick = {() => addSymptom()}
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#007BFF",
            color: "white",
            borderRadius: "16px",
            padding: "4px 8px",
          }}
        >
          <span>{name}</span>
          {!isSymptomSelectable && 
          <button
            onClick={() => onRemoveSelection(id)}
            style={{
              marginLeft: "8px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        }
        </div>
    );
}