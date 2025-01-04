import React from "react"

interface SelectionButtonProps{
    name: string;
    id: number;
    onRemoveSelection: (id: number) => void;
}

export default function SelectionButton({name, id, onRemoveSelection}: SelectionButtonProps){
    return(
        <div
          key={id}
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
        </div>
    );
}