import React, { useEffect, useState, useCallback, useRef } from "react";
import Tree, { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import "./custom-tree.css";
import "./tree-container.css";
import { useFetchTree } from "../Utilities/useFetchTree";

interface Disease {
  id: number;
  Name: string;
}

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

interface PreselectedInputs {
  id: number;
  Index: number;
  Name: string;
}

interface AlgorithmTreeProp {
  selectedDisease: PreselectedInputs | null;
  updateTree: boolean;
  onStateChange: (newState: {
    selectedNodeId: [number | null, number | null];
    selectedLinkInfo: [number | null, number | null, number | null];
    updateForm: boolean;
  }) => void; // Update callback type
}

export default function AlgorithmTree({
  selectedDisease,
  updateTree,
  onStateChange,
}: AlgorithmTreeProp) {
  //set tree variable to look like the RawNodeDatum(s). Set first node to have these 2 parameters' value
  const [tree, setTree] = useState<RawNodeDatum | RawNodeDatum[]>({
    name: "Root",
    children: [],
  });
  console.log("Loading tree");

  //node: get the node ID and diseaseID to send to the nodeform
  const [selectedNodeId, setSelectedNodeId] = useState<
    [number | null, number | null]
  >([null, null]);

  const treeContainerRef = useRef(null); // Reference to the tree container
  const [treeDimensions, setTreeDimensions] = useState({ width: 0, height: 0 });

  //next step info to send
  //Nextstep sourceID, targetID, diseaseID
  const [selectedLinkInfo, setSelectedLinkInfo] = useState<
    [number | null, number | null, number | null]
  >([null, null, null]);

  // check whether updating form with node
  const [updateForm, setUpdateForm] = useState<boolean>(false);

  //set the tree
  const selectedDiseaseIndex = selectedDisease?.Index || 0;
  //useHooks and useState have to be outside of conditions. Call at top level
  var treeData = useFetchTree(selectedDiseaseIndex, updateTree);

  useEffect(() => {
    if (treeData) {
      console.log("tree data fetching");
      const [diseaseNode, algorithm, algorithmMap] = treeData;
      const tree = createTree(diseaseNode, algorithm, algorithmMap);
      setTree(tree);
    }
  }, [treeData, updateTree]);

  useEffect(() => {
    // Measure the dimensions of the tree container once it has rendered
    if (treeContainerRef.current) {
      const { offsetWidth, offsetHeight } = treeContainerRef.current;
      setTreeDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [tree]); // Re-run this effect whenever the tree updates

  const handleTreeNodeClick = (nodeDatum: TreeNodeDatum) => {
    //erases link info because not updating that anymore
    setSelectedLinkInfo([null, null, null]);
    setUpdateForm(false);
    setSelectedNodeId([
      parseInt(nodeDatum.attributes?.id as string) ?? null,
      parseInt(nodeDatum.attributes?.diseaseId as string) ?? null,
    ]);
    console.log(
      "Node ID:",
      parseInt(nodeDatum.attributes?.id as string) ?? null
    );
    onStateChange({
      selectedNodeId: selectedNodeId,
      selectedLinkInfo: selectedLinkInfo,
      updateForm: updateForm,
    });
  };

  // Link click
  const handleLinkClick = (
    sourceNode: TreeNodeDatum,
    targetNode: TreeNodeDatum
  ) => {
    //erase node info
    setSelectedNodeId([null, null]);
    setUpdateForm(false);
    setSelectedLinkInfo([
      parseInt(sourceNode.attributes?.id as string),
      parseInt(targetNode.attributes?.id as string),
      parseInt(sourceNode.attributes?.diseaseId as string) ?? null,
    ]);
    console.log(selectedLinkInfo);
    console.log("Source node name:", sourceNode.name);
    console.log("Target node name:", targetNode.name);
    onStateChange({
      selectedNodeId: selectedNodeId,
      selectedLinkInfo: selectedLinkInfo,
      updateForm: updateForm,
    });
  };

  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`
    <div className="tree-container" ref={treeContainerRef}>
      <Tree
        data={tree}
        zoomable={false}
        translate={{ x: treeDimensions.width / 2, y: 20 }}
        orientation="vertical"
        onNodeClick={(node) => handleTreeNodeClick(node.data)}
        onLinkClick={(sourceNode, targetNode) =>
          handleLinkClick(sourceNode.data, targetNode.data)
        }
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
      />
    </div>
  );
}

const tree: RawNodeDatum[] = [];

function createTree(
  diseaseNode: Disease,
  root: Algorithm,
  algorithmMap: Map<number, Algorithm>
) {
  const rootDiseaseNode: RawNodeDatum = {
    name: diseaseNode.Name,
    attributes: {
      id: diseaseNode.id,
    },
  };

  rootDiseaseNode.children = [];

  if (root != undefined) {
    //create the root node
    const rootAlgNode: RawNodeDatum = {
      name: root.Name,
      attributes: {
        id: root.id,
        diseaseId: diseaseNode.id,
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

function DFSRecursive(
  node: RawNodeDatum,
  algorithmMap: Map<number, Algorithm>
) {
  // Initialize children property if it's not already defined
  if (!node.children) {
    node.children = [];
  }
  //get the node information from algorithmMap and loop through its nextsteps (figure out children)
  const nodeId = node.attributes?.id;
  const nodeAlgorithmMap =
    nodeId !== undefined ? algorithmMap.get(parseInt(nodeId.toString())) : null;
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
              id: childNode.id,
              diseaseId: childNode.Disease,
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
