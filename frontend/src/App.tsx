import React from 'react';
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import VisualizeBackend from './Pages/VisualizeBackend';
import Main from './Pages/Main';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },

  {
    path: "visualizeBackend",
    element: <VisualizeBackend />
  }
]);


const App: React.FC = () => {
  return (
    <RouterProvider router = {router} />
  );
};

export default App;
