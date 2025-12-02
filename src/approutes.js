import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import App from "./App";



const approutes=<BrowserRouter basename="/"> 
<Routes>
    <Route  path="/" element={<App/>}></Route>
    <Route  path="login" element={<LoginPage/>}></Route>

</Routes>


</BrowserRouter>

export default approutes;