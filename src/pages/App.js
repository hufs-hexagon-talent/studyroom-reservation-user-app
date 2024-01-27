import Button from '../components/Button'
import React from 'react';

const App = () => (
  <div>
    <div>Hello World</div>
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
