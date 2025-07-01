import React, {useState, useEffect} from "react";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

interface Disease{
    id: number;
    Name: string;
    ManagementPlaceholder: string;
}

interface RecommendedManagementDataProp{
    disease_ids: number[];
}

export default function RecommendedManagement({disease_ids}: RecommendedManagementDataProp) {
    const [diseaseNames, setDiseaseNames] = useState<Record<number, string>>({});
    const [managementDescriptions, setManagementDescriptions] = useState<Record<number, string>>({});
    const [areRecommendedManagementsVisible, setAreRecommendedManagementsVisible] = useState(true);
    useEffect(() => {
        const fetchDisease = async() => {
            try{
                const response = await axios.get<Disease[]>(`${API_URL}/api/main/showDiseases/`);
                const diseaseMap: Record<number, string> = {};
                const managementMap: Record<number, string> = {};

                response.data.forEach((disease) => {
                    diseaseMap[disease.id] = disease.Name;
                    managementMap[disease.id] = disease.ManagementPlaceholder;
                })
                setDiseaseNames(diseaseMap);
                setManagementDescriptions(managementMap);
            } catch (error) {
                console.error("Error fetching diseases:", error);
            }
        }
        fetchDisease();
    }, [])

    const toggleRecommendedManagementsVisibility = () => {
        setAreRecommendedManagementsVisible((prev) => !prev);
    }

    return (
        <div>
            <h4
                onClick={toggleRecommendedManagementsVisibility}
                style={{ display: "flex", alignItems: "center", userSelect: "none" }}
            >
                Management of Diagnosed Diseases
                <span style={{ marginLeft: "8px" }}>{areRecommendedManagementsVisible ? "▲" : "▼"}</span>
            </h4>

            {areRecommendedManagementsVisible && (
                <div>
                    {disease_ids.map((id) => (
                        <div key = {id}>
                            <h5 style={{ fontSize: "18px", marginBottom: "8px", paddingLeft:"16px"}}>
                                {diseaseNames[id] || `Disease id ${id}`}
                            </h5>
                            <p style={{ marginTop: "8px", color: "#555", paddingLeft: "32px"}}>
                                {managementDescriptions[id]
                                    ? managementDescriptions[id].split('\n').map((line, index) => (
                                        <span key={index}>
                                        {"○ " + line}
                                        <br />
                                        </span>
                                    ))
                                    : 'No management found'}
                            </p>
                        </div>
                        
                    )
                    )}
                </div>
            )}
        </div>
    );
}