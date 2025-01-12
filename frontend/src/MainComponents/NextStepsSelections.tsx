import React, { useState } from "react";

interface NextStepsDataProp{
    name: string;
}

export default function NextStepsSelections({name}: NextStepsDataProp){
    const [areNextStepsVisible, setAreNextStepsVisible] = useState(false);

    const toggleNextStepsVisibility = () =>{
        setAreNextStepsVisible((prev) => !prev);
    }

    return(
        <div>
        <h4
        onClick={toggleNextStepsVisibility}
        style = {{
            display: "flex", 
            alignItems: "center",
            userSelect:"none"        
        }}
        >Suggested {name + " "}
        <span style = {{marginLeft: "8px "}}>
            {areNextStepsVisible ? "▲" : "▼"}
        </span>
        </h4>
        { areNextStepsVisible && (
            <div className = "next-steps-choices">
            <h4>Prompt to answer</h4>
            <p>Next Steps selections for the prompt</p>
            <p>Could have the selected algorithms so far here that can be canceled out to re-do some of the decisions (like for the symptoms selected)</p>
            </div>
        )}
      </div>
    );
}