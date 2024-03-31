import axios from "axios";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Disease from "../VisualizationComponents/Disease";
import AddSymptomModal from "VisualizationComponents/AddSymptomModal";

interface SymptomFormProps {}

const SymptomForm: React.FC<SymptomFormProps> = () => {
  return (
    // <div>
    //   <button
    //     type="button"
    //     className="btn btn-primary"
    //     data-bs-toggle="modal"
    //     data-bs-target="#exampleModal"
    //   >
    //     Open Symptom Panel
    //   </button>
    //   <AddSymptomModal />
    // </div>
    <Disease />
  );
};

export default SymptomForm;
