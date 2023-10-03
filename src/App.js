import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Country from "./pages/Country";
import 'react-toastify/dist/ReactToastify.css';
import NewHome from "./pages/V2/NewHome";
import NewAnalytics from "./pages/V2/NewAnalytics";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/v1" element={<Home />} />
        <Route index element={<NewHome />} />
        <Route path="/analytics/:keyword" element={<Analytics />} />
        <Route path="/analytics/v2/:keyword" element={<NewAnalytics />} />
        <Route path="/country/:country" element={<Country />} />
      </Routes>
    </BrowserRouter>
  );

}
