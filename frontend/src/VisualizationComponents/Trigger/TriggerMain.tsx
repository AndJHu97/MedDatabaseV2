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

export default function TriggerMain(){
    const [selectedDisease, setSelectedDisease] = useState<PreselectedInputs | null>();
    const [updateDiseaseDropdown, setUpdateDiseaseDropdown] =
    useState<boolean>(false);

   // Form values for the trigger form
   const [formData, setFormData] = useState<{
    Name: string;
    Group: string;
    SymptomItems: number[]; // SymptomItems will be an array of symptom IDs
    SelectionType: string;
    SelectionAdditionalInfo: string;
    }>({
        Name: '',
        Group: '',
        SymptomItems: [],
        SelectionType: '',
        SelectionAdditionalInfo: ''
    });

    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [selectionTypes, setSelectionTypes] = useState<SelectionType[]>([]);

    // Fetch SymptomItems and SelectionTypes from the API
    useEffect(() => {
        axios.get('http://localhost:8000/api/trigger/showSymptoms/')  
            .then(response => setSymptoms(response.data))
            .catch(error => console.error(error));

        axios.get('http://localhost:8000/api/trigger/showSelection/')  
            .then(response => setSelectionTypes(response.data))
            .catch(error => console.error(error));
    }, []);


    //get disease change from Disease-Dropdown-Selection
    const handleDiseaseSelectionChange = (
        newSelectedDisease: PreselectedInputs | undefined
    ) => {
        if (newSelectedDisease) {
        setSelectedDisease(newSelectedDisease);
        }
    };

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle checkbox changes for SymptomItems
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prevState => {
            const updatedSymptomItems = checked
                ? [...prevState.SymptomItems, parseInt(value)] // Convert value to number
                : prevState.SymptomItems.filter(item => item !== parseInt(value));
            return {
                ...prevState,
                SymptomItems: updatedSymptomItems
            };
        });
    };

    // Submit the form data
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post('/api/trigger-checklist/', formData)
            .then(response => {
                console.log("Form submitted successfully:", response.data);
                // Optionally reset form or redirect
                setFormData({
                    Name: '',
                    Group: '',
                    SymptomItems: [],
                    SelectionType: '',
                    SelectionAdditionalInfo: ''
                });
            })
            .catch(error => console.error(error));
    };


    return(

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
                        <select
                            name="Group"
                            value={formData.Group}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                        >
                            <option value="">Select Group</option>
                            <option value="group1">Group 1</option>
                            <option value="group2">Group 2</option>
                        </select>
                    </label>
                </div>

                <fieldset style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
                    <legend>Symptoms</legend>
                    {symptoms.map(symptom => (
                        <label key={symptom.id} style={{ display: "block", margin: "5px 2" }}>
                            <input
                                type="checkbox"
                                value={symptom.id}
                                checked={formData.SymptomItems.includes(symptom.id)}
                                onChange={handleCheckboxChange}
                                style={{ marginRight: "10px" }} // Add margin here
                            />
                            {symptom.Name}
                        </label>
                    ))}
                </fieldset>

                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Selection Type:
                        <select
                            name="SelectionType"
                            value={formData.SelectionType}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                        >
                            <option value="">Select Selection Type</option>
                            {selectionTypes.map(selection => (
                                <option key={selection.id} value={selection.id}>
                                    {selection.Name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Additional Info:
                        <input
                            type="text"
                            name="SelectionAdditionalInfo"
                            value={formData.SelectionAdditionalInfo}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                    </label>
                </div>

                <button type="submit" style={{ padding: "10px", width: "100%", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Submit
                </button>
            </form>
        </div>
    );
}