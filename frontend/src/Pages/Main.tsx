import axios from 'axios';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
//import Disease from '../VisualizationComponents/VisualizationMain'

interface SymptomFormProps {}

const SymptomForm: React.FC<SymptomFormProps> = () => {
  const [testVariable, setTest] = useState<string>('');
  const [additionalQuestions, setAdditionalQuestions] = useState<string[] | null>(null); // State to store the additional questions

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post<{ additional_questions: string[] }>('http://localhost:8000/api/algorithms/', { testVariable });
      console.log('Response from backend:', response.data);
      
      // Check if 'additional_questions' exist in response data
      if (response.data && response.data.additional_questions) {
        // Set the additional questions in state
        setAdditionalQuestions(response.data.additional_questions);
      }
    } catch (error) {
      console.error('Error submitting symptoms:', error);
    }
  };


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Symptoms:
          <input type="text" value={testVariable} onChange={(e) => setTest(e.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>
      {additionalQuestions && ( // Display additional questions if available
        <div>
          <h2>Additional Questions:</h2>
          <ul>
            {additionalQuestions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
      
    </div>
  );
};

export default SymptomForm;
