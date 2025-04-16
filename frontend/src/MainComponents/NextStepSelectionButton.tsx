import React, { useState } from "react"

interface SelectionButtonProps{
    name: string;
    nextStepID: number;
    diseaseID: number;
    isSelectable: boolean;
    onSelection: (nextStepID: number, diseaseAlgorithmIndex: number, isSelected: boolean) => void;
}

export default function NextStepSelectionButton({name, nextStepID, diseaseID, isSelectable, onSelection}: SelectionButtonProps){
  const [isSelected, setIsSelected] = useState(false);
  
  const selectingButton = () =>{
    if(isSelectable){
      setIsSelected((prev) => !prev);

    //send selection
    onSelection(nextStepID, diseaseID, !isSelected);
    }
    
  }


    return(
        <button
          onClick = {selectingButton}
          key={nextStepID}
          style={{
            display: "flex",
                alignItems: "center",
                backgroundColor: isSelected ?  "#007BFF" : "#FF5733",
                color: "white",
                borderRadius: "16px",
                padding: "4px 8px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.3s",
          }
        }
        >
          <span>{name}</span>
        </button>
    );
}