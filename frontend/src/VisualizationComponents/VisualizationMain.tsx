//import { Form, FormControl, FormGroup, FormLabel, Button } from 'react-bootstrap';
//~ to update or delete node
import React, { useEffect, useState} from "react";
import NodeForm from "./NodeForm";
import AlgorithmTree from "./AlgorithmTree";
import NewDiseaseForm from "./NewDiseaseForm";
import {useFetchDiseaseSelection} from "../Utilities/useFetchDiseaseSelection";
import './custom-tree.css';

interface PreselectedInputs {
  id: number;
  Index: number;
  Name: string;
}

export default function VisualizeBackend() {
  
  const [diseaseAlg, setDiseaseAlg] = useState<PreselectedInputs[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<PreselectedInputs | null>();
   //node: get the node ID and diseaseID to send to the nodeform
   const [selectedNodeId, setSelectedNodeId] = useState<[number | null, number | null]>([null, null]);

  //next step info to send
  //Nextstep sourceID, targetID, diseaseID
  const [selectedLinkInfo, setSelectedLinkInfo] = useState<[number | null, number | null, number | null]>([null,null,null]);


  // check whether updating form with node
  const [updateForm, setUpdateForm] = useState<boolean>(false);

  //get diseasedata for disease tree dropdown menu to select
  //TO DO MOVE TO NEW FORM
  const diseaseData = useFetchDiseaseSelection();
  useEffect(() =>{
    setDiseaseAlg(diseaseData);
  })
  
   // Add event listener for key presses for update
   useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === '~')) {
       
        setUpdateForm(prevUpdateForm => !prevUpdateForm);
        console.log("Updating value: ", updateForm);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleTreeStateChange = (newState: { selectedNodeId: [number | null, number | null]; selectedLinkInfo: [number | null, number | null, number | null]; updateForm: boolean }) => {
    if(newState.selectedNodeId){
      setSelectedNodeId(newState.selectedNodeId);
    }

    if(newState.selectedLinkInfo){
      setSelectedLinkInfo(newState.selectedLinkInfo);
    }

    if(newState.updateForm != undefined || newState.updateForm != null){
      setUpdateForm(newState.updateForm);
    }
  }

//get the disease
//TO DO put in separate form along with the Select Disease Tree
const handleDiseaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedId = parseInt(e.target.value);
  const selectedDisease = diseaseAlg.find(disease => disease.id === selectedId);
  setSelectedDisease(selectedDisease);
};

  return (
    //make add disease a separate form
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%" }}>
        <NewDiseaseForm/>

      <div className="mb-3">
        <label htmlFor="diseaseSelect" className="form-label">Select Disease Tree:</label>
        <select
          className="form-control"
          id="diseaseAlg"
          name={selectedDisease?.Name}
          value={selectedDisease?.id}
          onChange={handleDiseaseSelect}
        >
          <option value="">Select a Disease</option>
          {diseaseAlg.map((diseaseAlgEach) => (
            <option key={diseaseAlgEach.id} value={diseaseAlgEach.id}>
              {diseaseAlgEach.Name}
            </option>
          ))}
        </select>
        </div>

      <div id="treeWrapper" style={{ width: "100%", height: "400px" }}>
      <AlgorithmTree selectedDisease={selectedDisease || null} onStateChange={handleTreeStateChange}/>
      </div>
      <NodeForm selectedNodeId={selectedNodeId}  selectedLinkInfo={selectedLinkInfo} updateForm = {updateForm}/>
  
  </div>
  );
}

/*Mitch's code

const queue: Algorithm[] = [];

  
  //add the nodes at beginning
  queue.unshift(root);

  //as long as there are nodes left
  while (queue.length !== 0) {
    const currNode = queue.pop();

    //? = undefined if currNode is null
    //Connect current node with the node that current node's nextstep is pointing to
    const len = currNode?.NextSteps.length;
    const childNodes: RawNodeDatum[] = [];
    console.log("length of curr node " + len);
    console.log("Current node id: " + currNode?.id);
    //go through all the nextstep in the childnode
    if (len !== null && len !== undefined) {
      for (let i = 0; i < len; i++) {
        //Create node which the next step is pointing to
        const childNodeId = currNode?.NextSteps[i].NextStepDiseaseAlgorithm;
        console.log("child node ID: " + childNodeId); 
        //Condition is what causes it to go from curr node to this child node
        const condition = currNode?.NextSteps[i].ConditionsForNextStep;
        if (childNodeId !== null && childNodeId !== undefined) {
          //get node from the map and add it to queue to go through
          const childNode = algorithmMap.get(childNodeId);
          if (childNode !== undefined) {
            queue.push(childNode);
            const childFormatted: RawNodeDatum = {
              name: childNode.Name,
              attributes: {
                "Decision Picked": condition!,
                "id": childNode.id
              },
            };
            //add to the childnode (nextstep pointing to) of curnode 
            childNodes.push(childFormatted);
          }
        }
      }
      //add curr node and the child node from nextstep
      const element: RawNodeDatum = {
        name: currNode?.Name!,
        attributes: {
          "id": currNode ? currNode.id : -1, // Provide a default value if currNode is undefined
        },
        children: childNodes,
      };
      tree.push(element);
    }
  }

  console.log("tree");
  console.log(tree);
  return tree;
  */