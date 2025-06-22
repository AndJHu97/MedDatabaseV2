import React from 'react';
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import VisualizeBackend from './Pages/VisualizeBackend';
import VisualizeTrigger from './Pages/Triggers'
import Main from './Pages/Main';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,  
  },

  {
  path: "*",
  element: <Main />  // or a 404 page if you want
  },


  {
    path: "visualizeBackend",
    element: <VisualizeBackend />
  },

  {
    path: "visualizeBackend/trigger",
    element: <VisualizeTrigger />
  }
]);


const App: React.FC = () => {
  return (
    <RouterProvider router = {router} />
  );
};

export default App;
