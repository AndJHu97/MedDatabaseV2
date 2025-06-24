import React, { useEffect, useState } from "react";
import DiseaseDropdownSelection from "../Disease-Dropdown-Selection";
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

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
  symptomState: string; // Assumed to be a string, could be updated if needed
}

export default function TriggerMain() {
  const [selectedDisease, setSelectedDisease] = useState<PreselectedInputs | null>();
  const [updateDiseaseDropdown, setUpdateDiseaseDropdown] = useState<boolean>(false);

  interface PreselectedInputs {
    id: number;
    Name: string;
  }

  //for adding new symptoms
  const [addSymptoms, setAddSymptoms] = useState<PreselectedInputs[]>([]);


  
  const [newSymptom, setNewSymptom] = useState('');

  // Form values for the trigger form
  const [formData, setFormData] = useState<{
    Name: string;
    Group: string;
    SelectedSymptoms: SelectedSymptom[]; // Each symptom with its type for the checklist logic
    PositiveSymptomIDs: number[];
    NegativeSymptomIDs: number[];
    MandatoryPositiveSymptomIDs: number[];
    MandatoryNegativeSymptomIDs: number[];
    SelectionTypeID: number | null;
    SelectionAdditionalInfo: string;
    ChecklistLogicInfo: string;
    SelectedDiseaseId: number | null;
    GeneralAdditionalInfo: string;
  }>({
    Name: '',
    Group: '',
    SelectedSymptoms: [],
    PositiveSymptomIDs:[],
    NegativeSymptomIDs: [],
    MandatoryPositiveSymptomIDs: [],
    MandatoryNegativeSymptomIDs: [],
    SelectionTypeID: null,
    SelectionAdditionalInfo: '',
    GeneralAdditionalInfo:'',
    ChecklistLogicInfo: '',
    SelectedDiseaseId: null
  });

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectionTypes, setSelectionTypes] = useState<SelectionType[]>([]);

  // Fetch Symptoms and Selection Types from the API
  useEffect(() => {
    axios.get(`${API_URL}/api/trigger/showSymptoms/`)
      .then(response => setSymptoms(response.data))
      .catch(error => console.error(error));

    axios.get(`${API_URL}api/trigger/showSelection/`)
      .then(response => setSelectionTypes(response.data))
      .catch(error => console.error(error));
  }, []);

  // Handle disease selection change
  const handleDiseaseSelectionChange = (newSelectedDisease: PreselectedInputs | undefined) => {
    setFormData((prevState) => ({
      ...prevState,
      SelectedDiseaseId: newSelectedDisease ? newSelectedDisease.id : null,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
  
    // Update the respective property
    setFormData((prevState) => {
      const updatedSymptoms = name === "SelectedSymptoms" ? [...prevState.SelectedSymptoms] : prevState.SelectedSymptoms;
      const { positive, negative, mandatoryPositive, mandatoryNegative } = categorizeSymptoms(updatedSymptoms);
  
      return {
        ...prevState,
        [name]: value,
        PositiveSymptomIDs: positive,
        NegativeSymptomIDs: negative,
        MandatoryPositiveSymptomIDs: mandatoryPositive,
        MandatoryNegativeSymptomIDs: mandatoryNegative,
        ChecklistLogicInfo: generateChecklistLogicInfo(updatedSymptoms),
      };
    });
  };
  
  //choosing a symptom option 
  const handleSymptomSelectionChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSymptomId = parseInt(e.target.value);
    const selectedSymptom = symptoms.find(symptom => symptom.id === selectedSymptomId);
    
    if (selectedSymptom) {
      //the current array of symptom id
      const updatedSymptoms = [...formData.SelectedSymptoms];
      updatedSymptoms[index] = {
        ...selectedSymptom,
        symptomState: "Positive", // Default to Positive since when changing symptoms, assuming want to eliminate the positive, negative, etc. (symptom state)
      };

      //save without the symptom's symptom state (positive, negative, etc.) to make things easier for backend processing (just return the array of symptoms ids)
      const updatedSymptomsIDs = [...formData.PositiveSymptomIDs];
      updatedSymptomsIDs[index] = selectedSymptomId;
      const updatedChecklistLogicInfo = generateChecklistLogicInfo(updatedSymptoms);
      setFormData((prevState) => ({
        ...prevState,
        SelectedSymptoms: updatedSymptoms,
        PositiveSymptomIDs: updatedSymptomsIDs,
        ChecklistLogicInfo: updatedChecklistLogicInfo
      }));
    }
  };

  const handleSelectionTypeChange = (index: number, selectionType: string) => {
    const updatedSymptoms = [...formData.SelectedSymptoms];
    updatedSymptoms[index].symptomState = selectionType;
    const updatedChecklistLogicInfo = generateChecklistLogicInfo(updatedSymptoms);

    setFormData((prevState) => ({
      ...prevState,
      SelectedSymptoms: updatedSymptoms,
      ChecklistLogicInfo: updatedChecklistLogicInfo
    }));
  };


  //add new symptom selection with positive, negative, etc. 
  const addSymptomSelection = () => {
    const updatedSymptoms = [...formData.SelectedSymptoms, { id: 0, Name: '', symptomState: "Positive" }];
    const updatedChecklistLogicInfo = generateChecklistLogicInfo(updatedSymptoms);
    const {positive, negative, mandatoryPositive, mandatoryNegative} = categorizeSymptoms(updatedSymptoms);
    setFormData((prevState) => ({
      ...prevState,
      PositiveSymptomIDs: positive,
      NegativeSymptomIDs: negative,
      MandatoryPositiveSymptomIDs: mandatoryPositive,
      MandatoryNegativeSymptomIDs: mandatoryNegative,
      SelectedSymptoms: updatedSymptoms,
      ChecklistLogicInfo: updatedChecklistLogicInfo
    }));
  };

  //helper function to separate out the symptoms to PositiveSymptomIds, etc. 
  const categorizeSymptoms = (selectedSymptoms: SelectedSymptom[]) =>{
    const positive: number[] = [];
    const negative: number[] = [];
    const mandatoryPositive: number[] = [];
    const mandatoryNegative: number[] = [];

    selectedSymptoms.forEach((symptom) => {
      switch(symptom.symptomState){
        case "Positive":
          positive.push(symptom.id);
          break;
        case "Negative":
          negative.push(symptom.id);
          break;
        case "Mandatory Positive":
          mandatoryPositive.push(symptom.id);
          break;
        case "Mandatory Negative":
          mandatoryNegative.push(symptom.id);
          break;
      }
    });

    return {positive, negative, mandatoryPositive, mandatoryNegative};

  };

  const generateChecklistLogicInfo = (SelectedSymptoms: SelectedSymptom[]) => {
    return SelectedSymptoms.map(symptom => {
      switch (symptom.symptomState) {
        case 'Positive':
          return `[(${symptom.id})], `;
        case 'Negative':
          return `![(${symptom.id})], `;
        case 'Mandatory Positive':
          return `*[(${symptom.id})], `;
        case 'Mandatory Negative':
          return `!*[( ${symptom.id} )], `;
        default:
          return '';
      }
    }).join("\n");
  };

  const removeSymptom = (index: number) => {
    const updatedSymptoms = formData.SelectedSymptoms.filter((_, i) => i !== index);
    const {positive, negative, mandatoryPositive, mandatoryNegative} = categorizeSymptoms(updatedSymptoms);
    const updatedChecklistLogicInfo = generateChecklistLogicInfo(updatedSymptoms);
    setFormData((prevState) => ({
      ...prevState,
      SelectedSymptoms: updatedSymptoms,
      PositiveSymptomIDs: positive,
      NegativeSymptomIDs: negative,
      MandatoryPositiveSymptomIDs: mandatoryPositive,
      MandatoryNegativeSymptomIDs: mandatoryNegative,
      ChecklistLogicInfo: updatedChecklistLogicInfo
    }));
  };

  //modal for inputting new symptoms
  const [showNewSymptomForm, setShowNewSymptomForm] = useState(false);
  const handleAddSymptom = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/add_symptom/`, { name: newSymptom });
      setAddSymptoms([...symptoms, response.data]);
      setNewSymptom('');
      setShowNewSymptomForm(false);
    } catch (error) {
      console.error('Error adding symptom:', error);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post(`${API_URL}/api/trigger/submitTriggerForm/`, formData)
      .then(response => {
        console.log("Form submitted successfully:", response.data);
        setFormData({
          Name: '',
          Group: '',
          SelectedSymptoms: [],
          PositiveSymptomIDs: [],
          NegativeSymptomIDs: [],
          MandatoryPositiveSymptomIDs: [],
          MandatoryNegativeSymptomIDs: [],
          SelectionTypeID: null,
          SelectionAdditionalInfo: '',
          GeneralAdditionalInfo: '',
          ChecklistLogicInfo: '',
          SelectedDiseaseId: null
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
                      checked={selectedSymptom.symptomState === "Positive"}
                      onChange={() => handleSelectionTypeChange(index, "Positive")}
                    />
                    Positive
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.symptomState === "Negative"}
                      onChange={() => handleSelectionTypeChange(index, "Negative")}
                    />
                    Negative
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.symptomState === "Mandatory Positive"}
                      onChange={() => handleSelectionTypeChange(index, "Mandatory Positive")}
                    />
                    Mandatory Positive
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSymptom.symptomState === "Mandatory Negative"}
                      onChange={() => handleSelectionTypeChange(index, "Mandatory Negative")}
                    />
                    Mandatory Negative
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeSymptom(index)}
                  style={{ marginLeft: "5px", padding: "5px", borderRadius: "3px", backgroundColor: "#ff4d4d", color: "white", border: "none" }}
                >
                  Remove Symptom
                </button>
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

        <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowNewSymptomForm(!showNewSymptomForm)}> Add New Symptom</button>
        {showNewSymptomForm && (
          <div className="mt-4">
          <h4>Add New Symptom</h4>
          <div className="mb-3">
            <label htmlFor="new-symptom" className="form-label">Symptom Name:</label>
            <input
              type="text"
              className="form-control"
              id="new-symptom"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
            />
            <br></br>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddSymptom}
          >
            Add Symptom
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => setShowNewSymptomForm(false)}
          >
            Cancel
          </button>
        </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label>
            Checklist Logic Info:
            <textarea
              name="ChecklistLogicInfo"
              value={formData.ChecklistLogicInfo}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Selection Type:
            <select
              name="SelectionTypeID"
              value={formData.SelectionTypeID || ''}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Select Type</option>
              {selectionTypes.map((selection) => (
                <option key={selection.id} value={selection.id}>
                  {selection.Name}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label>
            Selection Additional Info:
            <textarea
              name="SelectionAdditionalInfo"
              value={formData.SelectionAdditionalInfo}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            General Additional Info:
            <textarea
              name="GeneralAdditionalInfo"
              value={formData.GeneralAdditionalInfo}
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
