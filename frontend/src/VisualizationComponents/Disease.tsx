//import { Form, FormControl, FormGroup, FormLabel, Button } from 'react-bootstrap';
//~ to update or delete node
import React, { useEffect, useState, useCallback } from "react";
import Tree, { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import axios from "axios";
import NodeForm from "./NodeForm";
import NewDiseaseForm from "./NewDiseaseForm";
import './custom-tree.css';
interface Algorithm {
  id: number;
  Name: string;
  DiseaseName: string;
  Notes: string | null;
  Disease: number;
  ExamType: number;
  Triggers: any[]; // Update with appropriate type if known
  NextSteps: NextStep[];
}

interface Disease{
  id: number;
  Name: string;
}

interface NextStep {
  id: number;
  NextStepName: string;
  ConditionsForNextStep: string;
  NumberConditionsForNextStep: number | null;
  OperatorConditionForNumber: string | null;
  NextStepHistoryWorkup: any; // Update with appropriate type if known
  NextStepHistoryAssessment: any; // Update with appropriate type if known
  NextStepVitalWorkup: any; // Update with appropriate type if known
  NextStepVitalAssessment: any; // Update with appropriate type if known
  NextStepPEWorkup: any; // Update with appropriate type if known
  NextStepPEAssessment: any; // Update with appropriate type if known
  NextStepTestWorkup: any; // Update with appropriate type if known
  NextStepTestAssessment: any; // Update with appropriate type if known
  NextStepDiseaseAlgorithm: number | null;
  NextStepDiseaseAssessment: any; // Update with appropriate type if known
  NextStepDiseaseDiagnosis: any; // Update with appropriate type if known
  Symptom: any; // Update with appropriate type if known
  ExamType: number;
}

interface Node {
  id: number;
  Name: string;
  Notes: string;
  Management: any; // Update with appropriate type if known
  algorithms: Algorithm[];
}

export default function AlgorithmTree() {
  //set tree variable to look like the RawNodeDatum(s). Set first node to have these 2 parameters' value
  const [tree, setTree] = useState<RawNodeDatum | RawNodeDatum[]>({
    name: "Root",
    children: [],
  });

  interface PreselectedInputs {
    id: number;
    Index: number;
    Name: string;
  }
  const [diseaseAlg, setDiseaseAlg] = useState<PreselectedInputs[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<PreselectedInputs>();

   //node: get the node ID and diseaseID to send to the nodeform
   const [selectedNodeId, setSelectedNodeId] = useState<[number | null, number | null]>([null, null]);

  //next step info to send
  //Nextstep sourceID, targetID, diseaseID
  const [selectedLinkInfo, setSelectedLinkInfo] = useState<[number | null, number | null, number | null]>([null,null,null]);


  // check whether updating form with node
  const [updateForm, setUpdateForm] = useState<boolean>(false);

  //show new disease form
  const [showNewDiseaseForm, setShowNewDiseaseForm] = useState<boolean>(false);
  //run at first at beginning. Set tree and get list of diseases
  useEffect(() => {
    const fetchData = async () => {
      try {
        //waits until gets these nodes to run rest
        const response = await axios.get<Node[]>(
          "http://localhost:8000/api/algorithms/"
        );
        const data = response.data;
        
        //get selectedDiseaseTree (default is tree of 0 index)
        const index = selectedDisease?.Index || 0;

        // Convert the array of Algorithm objects to a Map
        const algorithmMap: Map<number, Algorithm> =
          response.data[index].algorithms.reduce((map, algorithm) => {
            //convert to algorithm with key of id
            map.set(algorithm.id, algorithm);
            return map;
          }, new Map<number, Algorithm>());
        
          //this will be root node, whose children will be the algorithm
        const diseaseNode: Disease = {
          id: data[index].id,
          Name: data[index].Name,
        }
        const tree = createTree(diseaseNode, response.data[index].algorithms[0], algorithmMap);
        setTree(tree);

      } catch (error) {
        console.error("Error getting the disease algorithm tree information:", error);
      }
    };
    fetchData();
  }, [selectedDisease]);

  //This is for selecting a disease tree
  useEffect(() => {
    const fetchData = async () => {
      try {
        //waits until gets these nodes to run rest
        const response = await axios.get<Node[]>(
          "http://localhost:8000/api/algorithms/"
        );
        //set the disease information. Note, second paramet of callback is index automatically for map
        const diseaseData = response.data.map((disease: any, index: number) => ({
          id: disease.id,
          Index: index,
          Name: disease.Name
        }
      ));

        setDiseaseAlg(diseaseData);

      } catch (error) {
        console.error("Error getting the disease algorithm tree information:", error);
      }
    };
    fetchData();
  }, []);

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

  const handleTreeNodeClick = (nodeDatum: TreeNodeDatum) => {
    //erases link info because not updating that anymore
    setSelectedLinkInfo([null,null,null]);
    setUpdateForm(false);
    setSelectedNodeId([parseInt(nodeDatum.attributes?.id as string) ?? null, parseInt(nodeDatum.attributes?.diseaseId as string) ?? null]);
    console.log("Node ID:", parseInt(nodeDatum.attributes?.id as string) ?? null);
  };

  // Link click
const handleLinkClick = (
  sourceNode: TreeNodeDatum,
  targetNode: TreeNodeDatum
) => {
  //erase node info
  setSelectedNodeId([null, null]);
  setUpdateForm(false);
  setSelectedLinkInfo([parseInt(sourceNode.attributes?.id as string), parseInt(targetNode.attributes?.id as string), parseInt(sourceNode.attributes?.diseaseId as string) ?? null])
  console.log(selectedLinkInfo);
  console.log('Source node name:', sourceNode.name);
  console.log('Target node name:', targetNode.name);
};

//get the disease
const handleDiseaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedId = parseInt(e.target.value);
  const selectedDisease = diseaseAlg.find(disease => disease.id === selectedId);
  setSelectedDisease(selectedDisease);
};

  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
      <div id="treeWrapper" style={{ width: "50em", height: "50em" }}>
      <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowNewDiseaseForm(!showNewDiseaseForm)}>Add Disease</button>
      <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => setShowNewDiseaseForm(false)}
        >
          Cancel New Disease
        </button>
      {showNewDiseaseForm && (
        <NewDiseaseForm/>
      )}

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


      <Tree data={tree} 
      orientation="vertical" 
      onNodeClick={(node) => handleTreeNodeClick(node.data)}
      onLinkClick = {(sourceNode, targetNode) => handleLinkClick(sourceNode.data, targetNode.data)}
      rootNodeClassName="node__root"
      branchNodeClassName="node__branch"
      leafNodeClassName="node__leaf"
      />
      <NodeForm selectedNodeId={selectedNodeId}  selectedLinkInfo={selectedLinkInfo} updateForm = {updateForm}/>
  
  </div>
  );
}


const tree: RawNodeDatum[] = [];

function createTree(diseaseNode: Disease, root: Algorithm, algorithmMap: Map<number, Algorithm>) {
  const rootDiseaseNode: RawNodeDatum = {
    name: diseaseNode.Name,
    attributes: {
      "id": diseaseNode.id
    },
  };

  rootDiseaseNode.children = [];
  
  if(root != undefined){
     //create the root node
    const rootAlgNode: RawNodeDatum = {
      name: root.Name,
      attributes: {
        "id": root.id
      },
    };
    console.log("Algorithm Map: " + algorithmMap);
    const tree = DFSRecursive(rootAlgNode, algorithmMap);

    rootDiseaseNode.children.push(tree);
    //Final tree has disease node as first one
    

  }
  const finalTree = rootDiseaseNode;
  return finalTree;

}

function DFSRecursive(node : RawNodeDatum, algorithmMap: Map<number, Algorithm>)
{
  // Initialize children property if it's not already defined
  if (!node.children) {
    node.children = [];
  }
  //get the node information from algorithmMap and loop through its nextsteps (figure out children)
  const nodeId = node.attributes?.id;
  const nodeAlgorithmMap = nodeId !== undefined ? algorithmMap.get(parseInt((nodeId).toString())) : null
  const nodeNextSteps = nodeAlgorithmMap?.NextSteps;
  const len = nodeNextSteps?.length;
  
  //go through all the nextstep in node
  if (len !== null && len !== undefined && nodeNextSteps !== undefined) {
    for (let i = 0; i < len; i++) {
      //find next child in algorithmMap with nextstep and convert to rawdatumnode
      const childNodeId = nodeNextSteps[i].NextStepDiseaseAlgorithm;
      if (childNodeId !== null && childNodeId !== undefined) {


        //Condition is what causes it to go from curr node to this child node. Check if null or not
        const condition = nodeNextSteps[i].ConditionsForNextStep;
        //get childnode in algorithmMap
        const childNodeIdNumber = parseInt(childNodeId.toString());
        const childNode = algorithmMap.get(childNodeIdNumber);
        //convert to the RawNodeDatum
        if (childNode !== undefined) {
          
          const childFormatted: RawNodeDatum = {
            name: childNode.Name,
            attributes: {
              "Decision Picked": condition!,
              "id": childNode.id,
              "diseaseId": childNode.Disease
            },
          };

          node.children?.push(DFSRecursive(childFormatted, algorithmMap));
          
        }
      }
    }
  }
  //if no children, return itself
  return node;
}

/*Dumb bitch code

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