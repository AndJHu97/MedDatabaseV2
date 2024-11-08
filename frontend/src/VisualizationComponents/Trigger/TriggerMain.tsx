import React, { useEffect, useState } from "react";
import DiseaseDropdownSelection from "../Disease-Dropdown-Selection";
import axios from 'axios';

interface PreselectedInputs {
  id: number;
  Index: number;
  Name: string;
}

interface Symptom {
  id: number;
  Name: string;
}

interface SelectionType {
  id: number;
  Name: string;
}

interface SelectedSymptom {
  id: number;
  Name: string;
  selectionType: string; // Assumed to be a string, could be updated if needed
}

export default function TriggerMain() {
  const [selectedDisease, setSelectedDisease] = useState<PreselectedInputs | null>();
  const [updateDiseaseDropdown, setUpdateDiseaseDropdown] = useState<boolean>(false);

  // Form values for the trigger form
  const [formData, setFormData] = useState<{
    Name: string;
    Group: string;
    SelectedSymptoms: SelectedSymptom[]; // Each symptom with its type
    SelectionType: string;
    SelectionAdditionalInfo: string;
  }>({
    Name: '',
    Group: '',
    SelectedSymptoms: [],
    SelectionType: '',
    SelectionAdditionalInfo: ''
  });

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectionTypes, setSelectionTypes] = useState<SelectionType[]>([]);

  // Fetch Symptoms and Selection Types from the API
  useEffect(() => {
    axios.get('http://localhost:8000/api/trigger/showSymptoms/')
      .then(response => setSymptoms(response.data))
      .catch(error => console.error(error));

    axios.get('http://localhost:8000/api/trigger/showSelection/')
      .then(response => setSelectionTypes(response.data))
      .catch(error => console.error(error));
  }, []);

  // Handle disease selection change
  const handleDiseaseSelectionChange = (newSelectedDisease: PreselectedInputs | undefined) => {
    if (newSelectedDisease) {
      setSelectedDisease(newSelectedDisease);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for each element type if needed
    if (name === "SelectionType") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value, // This is a single string value
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  

  const handleSymptomSelectionChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSymptomId = parseInt(e.target.value);
    const selectedSymptom = symptoms.find(symptom => symptom.id === selectedSymptomId);
    
    if (selectedSymptom) {
      const updatedSymptoms = [...formData.SelectedSymptoms];
      updatedSymptoms[index] = {
        ...selectedSymptom,
        selectionType: "Positive", // Default to Positive or leave blank
      };

      setFormData((prevState) => ({
        ...prevState,
        SelectedSymptoms: updatedSymptoms,
      }));
    }
  };

  const handleSelectionTypeChange = (index: number, selectionType: string) => {
    const updatedSymptoms = [...formData.SelectedSymptoms];
    updatedSymptoms[index].selectionType = selectionType;

    setFormData((prevState) => ({
      ...prevState,
      SelectedSymptoms: updatedSymptoms,
    }));
  };

  const addSymptomSelection = () => {
    const updatedSymptoms = [...formData.SelectedSymptoms, { id: 0, Name: '', selectionType: "Positive" }];
    setFormData((prevState) => ({
      ...prevState,
      SelectedSymptoms: updatedSymptoms,
    }));
  };

  const generateAdditionalInfo = () => {
    return formData.SelectedSymptoms.map(symptom => {
      switch (symptom.selectionType) {
        case 'Positive':
          return `[(${symptom.id})], `;
        case 'Negative':
          return `![(${symptom.id})], `;
        case 'Mandatory Positive':
          return `*[(${symptom.id})]*, `;
        case 'Mandatory Negative':
          return `!*[( ${symptom.id} )], `;
        default:
          return '';
      }
    }).join("\n");
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post('/api/trigger-checklist/', formData)
      .then(response => {
        console.log("Form submitted successfully:", response.data);
        setFormData({
          Name: '',
          Group: '',
          SelectedSymptoms: [],
          SelectionType: '',
          SelectionAdditionalInfo: ''
        });
      })
      .catch(error => console.error(error));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "20px" }}>
      <DiseaseDropdownSelection
        onDiseaseSelectionChange={handleDiseaseSelectionChange}
        onUpdate={updateDiseaseDropdown}
      />

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "600px", border: "1px solid #ccc", borderRadius: "5px", padding: "20px", marginTop: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center" }}>Trigger Form</h2>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Name:
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Group:
            <input
              name="Group"
              value={formData.Group}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Symptoms:
            {formData.SelectedSymptoms.map((selectedSymptom, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <select
                  value={selectedSymptom.id}
                  onChange={(e) => handleSymptomSelectionChange(index, e)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="">Select a Symptom</option>
                  {symptoms.map((symptom) => (
                    <option key={symptom.id} value={symptom.id}>
                      {symptom.Name}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: "10px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.selectionType === "Positive"}
                      onChange={() => handleSelectionTypeChange(index, "Positive")}
                    />
                    Positive
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.selectionType === "Negative"}
                      onChange={() => handleSelectionTypeChange(index, "Negative")}
                    />
                    Negative
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.selectionType === "Mandatory Positive"}
                      onChange={() => handleSelectionTypeChange(index, "Mandatory Positive")}
                    />
                    Mandatory Positive
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.selectionType === "Mandatory Negative"}
                      onChange={() => handleSelectionTypeChange(index, "Mandatory Negative")}
                    />
                    Mandatory Negative
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSymptomSelection}
              style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              + Add Symptom
            </button>
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Selection Type:
            <select
              name="SelectionType"
              value={formData.SelectionType}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Select Type</option>
              {selectionTypes.map((selection) => (
                <option key={selection.id} value={selection.Name}>
                  {selection.Name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Additional Info:
            <textarea
              name="SelectionAdditionalInfo"
              value={generateAdditionalInfo()}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
