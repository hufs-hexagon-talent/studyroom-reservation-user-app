import { Route, Routes, BrowserRouter } from "react-router-dom";
import App from "./pages/App";
import SelectRoom from "./pages/studyroom/SelectRoom";
import Login from "./pages/login/Login";
import Room from "./pages/studyroom/roomId/Timetable";
// hi
const Router = () => {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASEURL || "/"}>
      <Routes>
        <Route path="/" element={<App />} /> {/* 소개 페이지 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/rooms" element={<SelectRoom />} /> {/* Room 목록 */}
        <Route path="/rooms/:roomId/" element={<Room />} /> {/* 특정 Room */}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;  
