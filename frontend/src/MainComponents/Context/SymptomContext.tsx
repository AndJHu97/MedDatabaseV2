// SymptomContext.tsx
import React, { createContext, useState } from "react";

export interface Symptom {
  id: number;
  Name: string;
}

interface SymptomsContextType {
  selectedSymptoms: Symptom[];
  setSelectedSymptoms: React.Dispatch<React.SetStateAction<Symptom[]>>;
}


// ✅ Pass the interface as a generic to createContext
export const SymptomsContext = createContext<SymptomsContextType>({
    selectedSymptoms: [],
    setSelectedSymptoms: () => {}, // dummy function for initialization
  });
  