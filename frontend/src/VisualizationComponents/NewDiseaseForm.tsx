import React, { useState } from 'react';
import axios from 'axios';


export default function NewDiseaseForm() {
    const [diseaseFormData, setDiseaseFormData] = useState({
       Name: '',
       Notes: ''
      });

      const initialFormState = {
        Name: '',
        Notes: ''
      };

  const handleAddDisease = async () => {
    try {
        const response = await axios.post('http://localhost:8000/api/add_disease/', diseaseFormData);
        setDiseaseFormData(initialFormState);
    } catch (error) {
      console.error('Error adding symptom:', error);
    }
  };

  // Function to handle form field changes and update the formData state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiseaseFormData({ ...diseaseFormData, [name]: value });
  };

  return (
    <div className="mt-4">
        <h2>Add New Disease</h2>
        <div className="mb-3">
          <label htmlFor="Name" className="form-label">Disease Name:</label>
          <input
            type="text"
            className="form-control"
            id="Name"
            name = "Name"
            value={diseaseFormData.Name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="Notes" className="form-label">Disease Notes:</label>
          <input
            type="text"
            className="form-control"
            id="Notes"
            name = "Notes"
            value={diseaseFormData.Notes}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddDisease}
        >
          Add Disease
        </button>
        
        </div>
  );
};