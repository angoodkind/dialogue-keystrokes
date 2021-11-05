import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import $ from "jquery";
import 'jquery-confirm';
import "jquery-confirm/dist/jquery-confirm.min.css";

// Open a connection to the socket.io server 
// const socket = openSocket(`${constants.ec2Base}:8080`, {rejectUnauthorized: false, transports: ['websocket']});
const socket = openSocket(`localhost:8080`, {rejectUnauthorized: false, transports: ['websocket']});

// This is the App that will be rendered by React in index.js.
function AppPromptTime() {
  
  // These are React variables that control the state of the app. 
  const [subject, setSubject] = useState(null);
  const [room, setRoom] = useState();
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState(0);
  const [experiment, setExperiment] = useState(null);
  const [sentTime, setSentTime] = useState(Date.now());
  const [sends, setSends] = useState(null);
  const [prolific, setProlific] = useState(null);
  // const [experimentDateTime, setExperimentDateTime] = useState("");

  const prompts = [
    {promptNum:1, promptText:`Prompt 1: ${Date(Date.now())}`, promptTime:45000},
    {promptNum:2, promptText:`Redirecting...`, promptTime:20000}
  ]

  // Set up the socket in a useEffect with nothing in the dependency array,
  // to avoid setting up multiple connections.
  useEffect(() => {
    socket.once('connection', (data) => {
      console.log("data",JSON.stringify(data));
      console.log("My ID:", socket.id);
      console.log("my index:", data.count);
      console.log(`I'm connected with the back-end in room ${data.room}`);
    //   alert("You are Subject "+data.count);
        $.alert({
            title: 'Alert!',
            content: `You're subject ${data.count} <br> You're in room ${data.room}`,
            width: 'auto',
            // boxWidth: '30%',
            useBootstrap: false // Need this line to set width
        });    
      setSubject(data.count + 1);
      setRoom(data.room);
      // setExperimentDateTime(data.expDT);
    });
  },[])


  useEffect(()=> {
    // If the client is the first member in their room, initialize a firebase Node for the room to write to.
    socket.on('setNode', (data) => {
      console.log("setNode", data);
      // console.log("expDate",experimentDateTime)
    //   setExperiment(expDate+`-`+JSON.stringify(data));
    setExperiment(JSON.stringify(data));
    })
  },[])

  useEffect(() => {
    // If the client is the second member in their room, get the firebase Node that was already initialized.
    socket.on('getNode', (data) => {
      console.log("getNode", data);
      // console.log("expDate",experimentDateTime)
    //   setExperiment(expDate+`-`+JSON.stringify(data));
    setExperiment(JSON.stringify(data));
    })
  },[])


  useEffect(()=> {
    const timer = setTimeout(() => {
    //   if (prompt < constants.prompts.length-1) {
        if (prompt < prompts.length-1) {
        // When the time is up, increment the prompt state variable.
        setPrompt(prompt + 1);
      }
      // Time length of prompt 
    // }, constants.prompts[prompt].promptTime);
    }, prompts[prompt].promptTime);
    return () => {
      clearTimeout(timer);
    };
    // The warning and timer Timeout(s) will run once every time the prompt changes.
  },[prompt])


  // end study and redrect
  useEffect(()=> {
    // if (prompt >= constants.prompts.length-1) {
    if (prompt >= prompts.length-1) {
      console.log('Done with prompts');
      window.location.href = "https://forms.gle/ipvyLHKwNCFLnNsN8"
    }
  },[prompt])

  
  // This is the JSX (React's version of HTML) structure of the chat interface
  return (
    // There will never be 3 people in a room.
    subject >= 3 ? <div>ERROR</div> : 
    <div className="app">
      <div className="prompt">
        {/* Display the prompt based on which prompt you're on: */}
        {/* <div style={{margin: "50px"}}>{constants.prompts[prompt].promptText}</div> */}
        <div style={{margin: "50px"}}>{prompts[prompt].promptText}</div>
      </div>
    </div>
  );
}

export default AppPromptTime;