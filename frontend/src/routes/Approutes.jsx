import React from "react";
import Login from "../screens/login";
import Register from "../screens/register";
import Home from "../screens/home";
import Project  from "../screens/project";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import UserAuth from "../auth/UserAuth";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuth><Home/></UserAuth>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/Register" element={<Register/>}/> 
        <Route path="/project" element={<UserAuth><Project/></UserAuth>}/>
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
