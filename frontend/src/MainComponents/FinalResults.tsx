import react from "react";
import SelectionButton from "./SelectionButton";

interface FinalResultsProp{
    Result: string;
    onRemoveResults: (id: number) => void;
}

export default function FinalResults({Result, onRemoveResults}: FinalResultsProp){
    return(
        <div
        >
            <h4>Final Results</h4>
            <br></br>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f9f9f9",
                }}
            >
            <SelectionButton name = {Result} id = {0} onRemoveSelection={onRemoveResults}></SelectionButton>
            </div>
        </div>
    );
}