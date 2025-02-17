import React, { useState, useEffect } from "react";
import axios from "axios";
import SelectionButton from "./SelectionButton"; // Import your button component

interface NextSteps {
  symptom_id: number;
  trigger_name: string;
}

interface Symptom {
  id: number;
  Name: string; // Ensure this matches your Django model field name
}

interface NextStepsDataProp {
  name: string;
  NextSteps: NextSteps[];
}

export default function NextStepsSelections({ name, NextSteps }: NextStepsDataProp) {
  const [areNextStepsVisible, setAreNextStepsVisible] = useState(false);
  const [symptomNames, setSymptomNames] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get<Symptom[]>("http://localhost:8000/api/trigger/showSymptoms/");
        
        // Map symptoms correctly using `Name`
        const symptomMap: Record<number, string> = {};
        response.data.forEach((symptom) => {
          symptomMap[symptom.id] = symptom.Name; // Ensure 'Name' is used, not 'name'
        });

        setSymptomNames(symptomMap);
      } catch (error) {
        console.error("Error fetching symptoms:", error);
      }
    };

    fetchSymptoms();
  }, []);

  const toggleNextStepsVisibility = () => {
    setAreNextStepsVisible((prev) => !prev);
  };

  // Group symptoms by trigger name
  const groupedNextSteps: Record<string, NextSteps[]> = {};
  NextSteps.forEach((step) => {
    if (!groupedNextSteps[step.trigger_name]) {
      groupedNextSteps[step.trigger_name] = [];
    }
    groupedNextSteps[step.trigger_name].push(step);
  });

  return (
    <div>
      <h4
        onClick={toggleNextStepsVisibility}
        style={{
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        Suggested {name + " "}
        <span style={{ marginLeft: "8px" }}>{areNextStepsVisible ? "▲" : "▼"}</span>
      </h4>

      {areNextStepsVisible && (
        <div className="next-steps-choices">
          {Object.entries(groupedNextSteps).map(([triggerName, symptoms]) => (
            <div key={triggerName}>
              <h5 style={{ color: "#007BFF", fontSize: "18px", marginBottom: "8px" }}>{triggerName}</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {symptoms.map((step) => (
                  <SelectionButton
                    key={step.symptom_id}
                    id={step.symptom_id}
                    name={symptomNames[step.symptom_id] || `Symptom ${step.symptom_id}`}
                    onRemoveSelection={() => {}} // Implement removal logic if needed
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
