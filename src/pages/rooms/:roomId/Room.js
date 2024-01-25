import { useParams } from "react-router-dom";

const Room = (a) => {

    const {roomId} = useParams()
    return (<>
        <div>roomId: {roomId}</div>
    </>)
};

export default Room;
