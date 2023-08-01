import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Country from "./pages/Country";
import 'react-toastify/dist/ReactToastify.css';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/analytics/:keyword" element={<Analytics />} />
        <Route path="/country/:country" element={<Country />} />
      </Routes>
    </BrowserRouter>
  );

}
