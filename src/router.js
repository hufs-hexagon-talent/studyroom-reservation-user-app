import { Route, Routes, BrowserRouter } from "react-router-dom";
import App from "./pages/App";
import Rooms from "./pages/rooms/Rooms";
import Login from "./pages/login/Login";
import Room from "./pages/rooms/:roomId/Room";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* 소개 페이지 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/rooms" element={<Rooms />} /> {/* Room 목록 */}
        <Route path="/rooms/:roomId/" element={<Room />} /> {/* 특정 Room */}

      </Routes>
    </BrowserRouter>
  );
};

export default Router;


// /
