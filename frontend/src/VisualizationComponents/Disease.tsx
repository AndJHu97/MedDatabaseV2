import React, { useEffect, useState } from "react";
import Tree, { RawNodeDatum } from "react-d3-tree";
import axios from "axios";

// This is a simplified example of an org chart with a depth of 2.
// Note how deeper levels are defined recursively via the `children` property.
const orgChart = {
  name: "CEO",
  children: [
    {
      name: "Manager",
      attributes: {
        department: "Production",
      },
      children: [
        {
          name: "Foreman",
          attributes: {
            department: "Fabrication",
          },
          children: [
            {
              name: "Worker",
            },
          ],
        },
        {
          name: "Foreman",
          attributes: {
            department: "Assembly",
          },
          children: [
            {
              name: "Worker",
            },
          ],
        },
      ],
    },
  ],
};

interface Algorithm {
  ID: number;
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

interface Node {
  ID: number;
  Name: string;
  Notes: string;
  Management: any; // Update with appropriate type if known
  algorithms: Algorithm[];
}

export default function OrgChartTree() {
  const [tree, setTree] = useState<RawNodeDatum | RawNodeDatum[]>({
    name: "Root",
    children: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Node[]>(
          "http://localhost:8000/api/algorithms/"
        );
        const data = response.data;
        console.log(data[0]);

        // Convert the array of Algorithm objects to a Map
        const algorithmMap: Map<number, Algorithm> =
          response.data[0].algorithms.reduce((map, algorithm) => {
            map.set(algorithm.ID, algorithm);
            return map;
          }, new Map<number, Algorithm>());

        const formattedData: RawNodeDatum = {
          name: data[0].Name,
          children: data[0].algorithms.map((algorithm) => ({
            name: algorithm.Name,
          })),
        };
        const tree = createTree(response.data[0].algorithms[0], algorithmMap);
        setTree(tree);
      } catch (error) {
        console.error("Error submitting symptoms:", error);
      }
    };
    fetchData();
  }, []);
  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <div id="treeWrapper" style={{ width: "100em", height: "100em" }}>
      <Tree data={tree} orientation="vertical" />
    </div>
  );
}

const tree: RawNodeDatum[] = [];

function createTree(root: Algorithm, algorithmMap: Map<number, Algorithm>) {
  const queue: Algorithm[] = [];

  queue.unshift(root);

  while (queue.length !== 0) {
    const currNode = queue.pop();

    const len = currNode?.NextSteps.length;
    const childNodes: RawNodeDatum[] = [];

    if (len != null) {
      for (let i = 0; i < len; i++) {
        const childNodeId = currNode?.NextSteps[i].NextStepDiseaseAlgorithm;
        const condition = currNode?.NextSteps[i].ConditionsForNextStep;
        if (childNodeId !== null && childNodeId !== undefined) {
          const childNode = algorithmMap.get(childNodeId);
          if (childNode !== undefined) {
            queue.push(childNode);
            const childFormatted: RawNodeDatum = {
              name: childNode.Name,
              attributes: {
                "Decision Picked": condition!,
              },
            };
            childNodes.push(childFormatted);
          }
        }
      }
      const element: RawNodeDatum = {
        name: currNode?.Name!,
        children: childNodes,
      };
      tree.push(element);
    }
  }

  console.log("tree");
  console.log(tree);
  return tree;
}
