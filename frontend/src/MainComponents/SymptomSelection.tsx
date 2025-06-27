import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

interface Symptom {
  id: number;
  Name: string;
  ExamType: number;
}

interface ExamType {
  id: number;
  Name: string;
}

interface SymptomSelectionProps {
  onSymptomSubmit: (selectedSymptom: Symptom | null) => void;
}

interface SemanticResult {
  symptom_id: number;
  score: number;
}

export default function SymptomSelection({ onSymptomSubmit }: SymptomSelectionProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  //Whenever click on this, it won't make the dropdown go away
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  //When clicking outside of the search bar, will get rid of drop down
  useEffect(() =>{
    const handleClickOutside = (event: MouseEvent) =>{
      if(
        inputWrapperRef.current && 
        //When the cursor isn't in the search bar
        !inputWrapperRef.current.contains(event.target as Node)
      ){
          setShowDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    //When unmounts, eliminates this
    return () =>{
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [])

  // Fetch Symptoms and ExamTypes
  useEffect(() => {
    axios.get(`${API_URL}/api/main/showSymptoms/`)
      .then((response) => {
        setSymptoms(response.data);
        setFilteredSymptoms(response.data);
      })
      .catch((error) => console.error(error));

    axios.get(`${API_URL}/api/main/showExamTypes/`)
      .then((response) => {
        setExamTypes(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  // Filter symptoms when searchTerm or selectedExamType changes
  //Add semantic symptom search here
  /*** 
  useEffect(() => {
    const filtered = symptoms.filter(symptom =>
      symptom.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedExamType === null || symptom.ExamType === selectedExamType.id)
    );
    setFilteredSymptoms(filtered);
  }, [searchTerm, selectedExamType, symptoms]);
  */

  useEffect(() =>{
    //resets the search terms
    if(searchTerm.trim() === ""){
      setFilteredSymptoms(symptoms);
      return;
    }

    const fetchExactSearch = () => {
        //Get the exact word matches. This will be displayed first
        const exact_matched_symptoms = symptoms.filter(s => 
            s.Name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            (selectedExamType === null || s.ExamType === selectedExamType.id)
          );

        setFilteredSymptoms(exact_matched_symptoms);
    }

    fetchExactSearch();

  }, [searchTerm, selectedExamType, symptoms])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowDropdown(true);
  };

  const fetchSemanticMatches = async() => {
      try{
        const response = await axios.get(`${API_URL}/api/main/semanticSymptomSearch/`, {
          params: {search_term: searchTerm},
        });

        const results: SemanticResult[] = response.data;

        const matched_symptom_ids = results.map((r: SemanticResult) => r.symptom_id)

        const matched_symptoms = symptoms.filter(s => matched_symptom_ids.includes(s.id));
        console.log("Matched symptoms from semantic search ", matched_symptoms + " with search term ", searchTerm);
        const filtered_exam_type_matched_symptoms = matched_symptoms.filter(s => selectedExamType === null || s.ExamType === selectedExamType.id)

        //Get the exact word matches. This will be displayed first
        const exact_matched_symptoms = symptoms.filter(s => 
          s.Name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          (selectedExamType === null || s.ExamType === selectedExamType.id)
        );

        //Combine both arrys
        var combined = [...exact_matched_symptoms, ...filtered_exam_type_matched_symptoms];

        //Remove duplicates from both
        //Map automatically removes duplicates
        const unique_symptoms_map = new Map<number, Symptom>();
        combined.forEach(s => {
          //If it doesn't have this id, then add them
          if(!unique_symptoms_map.has(s.id))
          {
            unique_symptoms_map.set(s.id, s);
          }
        });

        //Only takes the values and removes the keys
        const combined_matched_symptoms = Array.from(unique_symptoms_map.values());

        setFilteredSymptoms(combined_matched_symptoms);

      }catch (error){
        console.error(error);
        setFilteredSymptoms([]);

      }
    };

  const handleSymptomSelect = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setSearchTerm(symptom.Name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    onSymptomSubmit(selectedSymptom);
  };

  const handleExamTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    if (isNaN(selectedId)) {
      setSelectedExamType(null);
    } else {
      const selected = examTypes.find(et => et.id === selectedId) || null;
      setSelectedExamType(selected);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <h4>Select a Symptom</h4>

      {/* Flex container for ExamType dropdown and search input */}
      <div ref={inputWrapperRef} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
        {/* ExamType Dropdown */}
        <select
          value={selectedExamType ? selectedExamType.id : ""}
          onChange={handleExamTypeChange}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            minWidth: "90px",
          }}
        >
          <option value="">All Exams</option>
          {examTypes.map((examType) => (
            <option key={examType.id} value={examType.id}>
              {examType.Name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search or select a symptom..."
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          {showDropdown && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                listStyle: "none",
                padding: "0",
                margin: "0",
                zIndex: 1000,
              }}
            >
              {filteredSymptoms.length > 0 ? (
                filteredSymptoms.map((symptom) => (
                  <li
                    key={symptom.id}
                    onClick={() => handleSymptomSelect(symptom)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {symptom.Name}
                  </li>
                ))
              ) : (
                <li style={{ padding: "8px", textAlign: "center", color: "#888" }}>
                  No symptoms found
                </li>
              )}
            </ul>
          )}

          
        </div>

        <button
            onClick={fetchSemanticMatches}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "block",
              
            }}
          >
            Advanced Search
          </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "block",
          width: "100%",
        }}
      >
        Submit
      </button>
    </div>
  );
}
