import { Route, Routes, BrowserRouter } from "react-router-dom";
import App from "./pages/App";
import Rooms from "./pages/Rooms";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/rooms" element={<Rooms />}>
          <Route path=":cardId" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
