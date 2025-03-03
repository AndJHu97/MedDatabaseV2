import React, { useState, useEffect } from "react";
import axios from "axios";
import SelectionButton from "./SelectionButton";

interface NextSteps {
  symptom_id: number;
  trigger_name: string;
}

interface Symptom {
  id: number;
  Name: string;
}

interface TriggerChecklist {
  id: number;
  Name: string | null;
  Group: string;
  PositiveSymptoms: Symptom[];
  NegativeSymptoms: Symptom[];
  MandatoryPositiveSymptoms: Symptom[];
  MandatoryNegativeSymptoms: Symptom[];
  ChecklistLogic: string | null;
  SelectionType: string | null;
  SelectionAdditionalInfo: string | null;
  GeneralAdditionalInfo: string | null;
  Disease: number | null;
}

interface Disease {
  id: number;
  Name: string;
}

interface RecommendedStepsDataProp {
  name: string;
  NextSteps: NextSteps[] | null;
  TriggerChecklists: TriggerChecklist[] | null;
}

export default function RecommendedStepsSelections({ name, NextSteps, TriggerChecklists }: RecommendedStepsDataProp) {
  const [areRecommendedStepsVisible, setAreRecommendedStepsVisible] = useState(false);
  const [symptomNames, setSymptomNames] = useState<Record<number, string>>({});
  const [diseaseNames, setDiseaseNames] = useState<Record<number, string>>({});

  // Fetch symptom names
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get<Symptom[]>("http://localhost:8000/api/main/showSymptoms/");
        const symptomMap: Record<number, string> = {};
        response.data.forEach((symptom) => {
          symptomMap[symptom.id] = symptom.Name;
        });
        setSymptomNames(symptomMap);
      } catch (error) {
        console.error("Error fetching symptoms:", error);
      }
    };
    fetchSymptoms();
  }, []);

  // Fetch disease names
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axios.get<Disease[]>("http://localhost:8000/api/main/showDiseases/");
        const diseaseMap: Record<number, string> = {};
        response.data.forEach((disease) => {
          diseaseMap[disease.id] = disease.Name;
        });
        setDiseaseNames(diseaseMap);
      } catch (error) {
        console.error("Error fetching diseases:", error);
      }
    };
    fetchDiseases();
  }, []);

  const toggleRecommendedStepsVisibility = () => {
    setAreRecommendedStepsVisible((prev) => !prev);
  };

  // Group NextSteps by trigger_name
  const groupedNextSteps: Record<string, NextSteps[]> = {};
  if (NextSteps) {
    NextSteps.forEach((step) => {
      if (!groupedNextSteps[step.trigger_name]) {
        groupedNextSteps[step.trigger_name] = [];
      }
      groupedNextSteps[step.trigger_name].push(step);
    });
  }

  return (
    <div>
      <h4
        onClick={toggleRecommendedStepsVisibility}
        style={{ display: "flex", alignItems: "center", userSelect: "none" }}
      >
        Suggested {name + " "}
        <span style={{ marginLeft: "8px" }}>{areRecommendedStepsVisible ? "▲" : "▼"}</span>
      </h4>

      {areRecommendedStepsVisible && (
        <div className="recommended-steps-choices">
          {NextSteps ? (
            Object.entries(groupedNextSteps).map(([triggerName, symptoms]) => (
              <div key={triggerName}>
                <h5 style={{ color: "#007BFF", fontSize: "18px", marginBottom: "8px" }}>{triggerName}</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {symptoms.map((step) => (
                    <SelectionButton
                      key={step.symptom_id}
                      id={step.symptom_id}
                      name={symptomNames[step.symptom_id] || `Symptom ${step.symptom_id}`}
                      onRemoveSelection={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            TriggerChecklists?.map((trigger) => (
              <div key={trigger.id}>
                <h5 style={{ color: "#007BFF", fontSize: "18px", marginBottom: "8px" }}>
                  {trigger.Disease ? `${diseaseNames[trigger.Disease] ?? "Unknown Disease"} - ` : ""}
                  {trigger.Name ?? "Unknown Trigger"}
                </h5>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
