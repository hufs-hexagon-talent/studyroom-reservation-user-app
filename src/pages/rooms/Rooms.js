import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate();

  return (<>
    <div>Select room</div>
    <br/>
    <Button text="306호" onClick={() => {
      console.log("select 306");
      navigate('/rooms/306');
    }} />
    <br/>
    <br/>
    <Button text="428호" onClick={() => {
      console.log("select 428")
      navigate('/rooms/428')
    }} />
  </>
  );
};

export default Rooms;
