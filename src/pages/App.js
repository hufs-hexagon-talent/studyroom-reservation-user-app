import Button from '../components/Button';
import React from 'react';

const App = () => (
  <div>
    <div>컴퓨터공학부 스터디룸 예약 시스템</div>
    <br/>
    <Button text="hi" onClick={() => {
      console.log("hi")
    }} />
    <Button text="22" onClick={() => {
      console.log("22")
    }} />
    <Button text="33" onClick={() => {
      console.log("33")
    }} />
  </div>
);

export default App;
