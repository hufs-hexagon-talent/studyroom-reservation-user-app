import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const Rooms = () => {
  const navigate = useNavigate();

  return (
    <div class="container">
      <div>Select room</div>
      <br />
      <div class="outside-room-select">
        <div class="container">
          <Button
            class="button-insied"
            text="306호"
            onClick={() => {
              console.log("select 306");
              navigate("/rooms/306");
            }}
          />
        </div>
      </div>
      <br />
      <br />
      <div class="outside-room-select">
        <div class="container">
          <Button
            class="button-inside"
            text="428호"
            onClick={() => {
              console.log("select 428");
              navigate("/rooms/428");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Rooms;
