import { Route, Routes, BrowserRouter } from "react-router-dom";
import App from "./pages/App";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gallery" element={<App />}>
          <Route path=":cardId" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
