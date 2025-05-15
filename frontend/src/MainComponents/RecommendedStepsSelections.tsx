import React, { useState, useEffect } from "react";
import axios from "axios";
import SelectionButton from "./SelectionButton";

interface NextSteps {
  symptom_id: number;
  trigger_name: string;
  source: string;
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
  TriggerNextSteps: NextSteps[] | null;
  TriggerChecklists: TriggerChecklist[] | null;
}

//if either one is null, it will only focus on the other one
export default function RecommendedStepsSelections({ name, TriggerNextSteps, TriggerChecklists }: RecommendedStepsDataProp) {
  const [areRecommendedStepsVisible, setAreRecommendedStepsVisible] = useState(true);
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

  // Group TriggerNextSteps by trigger_name
  const groupedNextSteps: Record<string, NextSteps[]> = {};
  if (TriggerNextSteps) {
    TriggerNextSteps.forEach((step) => {
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
        {name + " "}
        <span style={{ marginLeft: "8px" }}>{areRecommendedStepsVisible ? "▲" : "▼"}</span>
      </h4>

      {areRecommendedStepsVisible && (
        <div className="recommended-steps-choices">
          {TriggerNextSteps ? (
            Object.entries(groupedNextSteps).map(([triggerName, symptoms]) => (
              <div key={triggerName}>
                <h5 style={{ fontSize: "18px", marginBottom: "8px" }}>
                <a
                  href={symptoms[0].source}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007BFF", textDecoration: "underline" }}
                >
                    {triggerName}
                  </a>
                </h5>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {symptoms.map((step) => (
                    <SelectionButton
                      key={step.symptom_id}
                      id={step.symptom_id}
                      isSymptomSelectable = {true}
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
