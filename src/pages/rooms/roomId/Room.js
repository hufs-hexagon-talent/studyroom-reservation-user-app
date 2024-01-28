import { useParams } from "react-router-dom";
import Button from '../../../components/Button';

const Room = () => {
    const {roomId} = useParams();
    var pageContent;

    switch (roomId) {
        case '306':
            pageContent = <>
                <Button text="room 1" onClick={() => {
                    console.log("select room1");
                }}
                />
                <br/>
                <br/>
                <Button text="room 2" onClick={() => {
                    console.log("select room2");
                }}
                />
                <br/>
                <br/>
                <Button text="room 3" onClick={() => {
                    console.log("select room3");
                }}
                />
                <br/>
                <br/>
                <Button text="room 4" onClick={() => {
                    console.log("select room4");
                }}
                />
            </>
            break;
        case '428':
            pageContent = <>
                <Button text="room 1" onClick={() => {
                    console.log("select room1");
                }}
                />
                <br/>
                <br/>
                <Button text="room 2" onClick={() => {
                    console.log("select room2");
                }}
                />
            </>
            break;
        default:
            pageContent = <div> this is the default content for unknown rooms</div>
    }

    return (
        <>
            <div>{roomId} 호</div>
            <br/>
            {pageContent}
        </>
    );
};

export default Room;
