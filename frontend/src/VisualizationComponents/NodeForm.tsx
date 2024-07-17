import React, { useState, useEffect } from "react";
import axios from "axios";
//import { Form, FormControl, FormGroup, FormLabel, Button } from 'react-bootstrap';

function NodeForm({ selectedNodeId,  selectedLinkInfo, updateForm}: { selectedNodeId: [number | null, number | null],  selectedLinkInfo: [number | null, number | null, number | null], updateForm: boolean}) {
  const [formData, setFormData] = useState({
    ConditionsForNextStep: '',
    Symptom: '',
    ExamType: '',
    Name: '',
    Notes:'',
    Triggers: '',
    SelectedNodeId: '',
    DiseaseId: ''
  });
  
  //store the linkIDhere
  const [selectedLinkId, setSelectedLinkId] = useState<number>();
  
  interface PreselectedInputs {
    id: number;
    Name: string;
  }
  const [symptoms, setSymptoms] = useState<PreselectedInputs[]>([]);
  const [examTypes, setExamTypes] = useState<PreselectedInputs[]>([]);
  const [triggers, setTrigger] = useState<PreselectedInputs[]>([]);
 
   // Fetch data when the component mounts
   useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/algorithmsForm/");
        setSymptoms(response.data.symptoms);
        setExamTypes(response.data.examTypes);
        setTrigger(response.data.trigger);
      } catch (error) {
        console.error("Error fetching dropdown:", error);
      }
    };

    fetchData(); // Call the function to fetch data when the component mounts
  }, []); // Pass an empty dependency array to execute the effect only once

  //whenever the user selects a tree node, it changes the selected ID which activates this and updates the form variable
  useEffect(() => {
    setFormData(({...formData, 
      SelectedNodeId: selectedNodeId[0] !== null ? selectedNodeId[0].toString() : '',
      DiseaseId: selectedNodeId[1] !== null ? selectedNodeId[1].toString() : ''
    }));
    console.log("Node ID in form: " + selectedNodeId);
    console.log("update form bool: " + updateForm);
  },[selectedNodeId])

   // Fetch algorithm data to get rest of info of node
   useEffect(() => {
    const fetchAlgorithmData = async () => {
      if (updateForm) {
        //get the data and update form
        try {
          // Waits until gets these nodes to run the rest
          const response = await axios.get("http://localhost:8000/api/algorithms/");
          const data = response.data;
          //Use Node's diseaseid to populate form with the current form info
          const diseaseNodeAlgorithm = data.find((node:any) => node.id === selectedNodeId[1]);
         
          console.log(diseaseNodeAlgorithm);
          if(diseaseNodeAlgorithm){
            //use algorithmid
            const selectedAlgorithm = diseaseNodeAlgorithm.algorithms.find((algorithm:any) => algorithm.id === selectedNodeId[0]); 
            if(selectedAlgorithm){
              console.log(selectedAlgorithm);
              console.log("updating form");
              //update form
              setFormData({
                ...formData,
                Name: selectedAlgorithm.Name,
                Notes: selectedAlgorithm.Notes,
                Triggers: selectedAlgorithm.Triggers.join(', '), // Convert array to comma-separated string
              });
            }else{
              console.log("No algorithm found when updating form");
            }
          }else{
            console.log("No disease algorithm found when updating form");
          }

        //update the nextstep
        const diseaseLinkAlgorithm = data.find((node:any) => node.id === selectedLinkInfo[2]);
        
        if(diseaseLinkAlgorithm){
          console.log("updating form");
          //get sourceID
          const sourceAlgorithm = diseaseLinkAlgorithm.algorithms.find((algorithm:any) => algorithm.id === selectedLinkInfo[0])
          const targetAlgorithm = diseaseLinkAlgorithm.algorithms.find((algorithm:any) => algorithm.id === selectedLinkInfo[1])
          console.log("sourceAlgorithm");
          console.log(sourceAlgorithm);
          //find the nextstep ID

          //get the sourceAlgorithm list of nextstep and seeing which one points to target
          const listOfNextSteps = sourceAlgorithm.NextSteps;
          const matchingNextStep = listOfNextSteps.find((nextStep:any) => nextStep.NextStepDiseaseAlgorithm === targetAlgorithm.id);
          if (matchingNextStep) {
            console.log('Condition for this link:', matchingNextStep.ConditionsForNextStep);
            //set so the button click can handle it
            setSelectedLinkId(matchingNextStep.id);
          } else {
            console.warn('No matching next step found');
          }
          setFormData({
            ...formData,
            ConditionsForNextStep: matchingNextStep.ConditionsForNextStep,
            Symptom: matchingNextStep.Symptom,
            ExamType: matchingNextStep.ExamType
          });
        }

        } catch (error) {
          console.error("Error getting algorithm to update:", error);
        }
      }
      else{
        //if turn off update, then clear the form
        setFormData(prevState => ({
          ...prevState, // Keep the existing SelectedNodeId and DiseaseId
          ConditionsForNextStep: '',
          Symptom: '',
          ExamType: '',
          Name: '',
          Notes: '',
          Triggers: ''
        }));
      }
    };

    fetchAlgorithmData();
  }, [updateForm, selectedNodeId]); // Pass selectedNodeId as a dependency to ensure it's up-to-date

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    //make sure a current node is selected
    console.log("selectedNodeId: " + formData.SelectedNodeId);
    console.log("DiseaseId: " + formData.DiseaseId);
    if(formData.SelectedNodeId !== '' && formData.SelectedNodeId !== null){
      try {
        // Send data rest to post with axios
        const formDataJSON = JSON.stringify(formData);
        console.log(formDataJSON);
        const response = await axios.post("http://localhost:8000/api/algorithmsForm/", formData);
        console.log("Form submitted successfully: ", response.data);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
    
  };

  const handleUpdateLinkClick = async () => {
    const {ConditionsForNextStep, Symptom, ExamType} = formData;
    const updatedLinkInfo = {
      ConditionsForNextStep, Symptom, ExamType,
      "selectedLinkId": selectedLinkId
    }
    
    try{
      const updatedLinkInfoJSON = JSON.stringify(updatedLinkInfo);
      console.log("updated Node Info: " + updatedLinkInfoJSON);
      const response = await axios.post("http://localhost:8000/api/updateLink/", updatedLinkInfo);
      console.log("Form submitted successfully: ", response.data);
    } catch(error){
      console.error('Error updating link form:', error);
    }
    
   };
 
   const handleUpdateNodeClick = async () => {
    const {Name, Notes, Triggers} = formData;
    const updatedNodeInfo = {
      Name, Notes, Triggers, 
      "selectedNodeId": selectedNodeId[0]};
    try{
      const updatedNodeInfoJSON = JSON.stringify(updatedNodeInfo);
      console.log("updated Node Info: " + updatedNodeInfoJSON);
      const response = await axios.post("http://localhost:8000/api/updateNode/", updatedNodeInfo);
      console.log("Form submitted successfully: ", response.data);
    } catch(error){
      console.error('Error updating node form:', error);
    }
   };

   const handleDeleteNode = async () => {
      const deletedNodeId = {
        "deletedNodeId": selectedNodeId[0]
      }

      try{
        const response = await axios.delete("http://localhost:8000/api/deleteNode/", {data: deletedNodeId});
      }catch(error){
        console.error('Error updating node form:', error);
      }
  }
  // Function to handle form field changes and update the formData state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  return (
    <form className="ms-5 mb-10" onSubmit={handleSubmit}>
      <h2>Next Step Form</h2>
      <div className="mb-3">
        <label htmlFor="conditions" className="form-label">Conditions for Next Step:</label>
        <input
          type="text"
          className="form-control"
          id="ConditionsForNextStep"
          name="ConditionsForNextStep"
          value={formData.ConditionsForNextStep}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="symptom" className="form-label">Symptom to Add to Patient:</label>
        <select
          className="form-control"
          id="Symptom"
          name="Symptom"
          value={formData.Symptom}
          onChange={handleSelectChange}
        >
          <option value="">Select a Symptom</option>
          {symptoms.map((symptom) => (
            <option key={symptom.id} value={symptom.id}>
              {symptom.Name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="examType" className="form-label">Exam Type:</label>
        <select
          className="form-control"
          id="ExamType"
          name="ExamType"
          value={formData.ExamType}
          onChange={handleSelectChange}
        >
          <option value="">Select an Exam Type</option>
          {examTypes.map((examType) => (
            <option key={examType.id} value={examType.id}>
              {examType.Name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <h2>Next Test Information:</h2>
        <label htmlFor="test-name" className="form-label">Name of Test</label>
        <input
          type="text"
          className="form-control"
          id="Name"
          name="Name"
          value={formData.Name}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="notes" className="form-label">Notes:</label>
        <input
          type="text"
          className="form-control"
          id="Notes"
          name="Notes"
          value={formData.Notes}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="externalTriggers" className="form-label">Any Other External Triggers:</label>
        <select
          className="form-control"
          id="Triggers"
          name="Triggers"
          value={formData.Triggers}
          onChange={handleSelectChange}
        >
          <option value="">Select a Trigger</option>
          {triggers.map((trigger) => (
            <option key={trigger.id} value={trigger.id}>
              {trigger.Name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary">Submit Form</button>
      <button type="button" className="btn btn-primary" onClick={handleUpdateNodeClick} disabled = {selectedNodeId[0] == null || !updateForm}>Update Node</button>
      <button type="button" className="btn btn-primary" onClick={handleUpdateLinkClick} disabled = {selectedLinkInfo[0] == null || !updateForm}>Update Link</button>
      <button type="button" className="btn btn-primary" onClick={handleDeleteNode} disabled = {selectedNodeId[0] == null || !updateForm}>Delete Node</button>
      <button type="button" className="btn btn-primary" disabled = {selectedLinkInfo[0] == null || !updateForm}>Delete Link</button>
    </form>
  );
}

export default NodeForm;
