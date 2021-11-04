import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/database';
import * as constants from './constants';

// Must configure firebase before using its services
firebase.initializeApp(constants.firebaseConfig);

// Open a connection to the socket.io server 
const socket = openSocket(`${constants.ec2Base}:8080`, {rejectUnauthorized: false, transports: ['websocket']});

// time-stamp at beginning of experiment
const d = new Date();  
const expDate = d.toLocaleDateString().replace(/\//g,'-'); // replace all /'s with -'s
const expTime = d.toLocaleTimeString('en-GB'); //24-hour time format
const expNode = expDate+`_`+expTime;

// This is the App that will be rendered by React in index.js.
function App() {
  
  // These are React variables that control the state of the app. 
  const [subject, setSubject] = useState(null);
  const [room, setRoom] = useState();
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState(0);
  const [experiment, setExperiment] = useState(null);
  const [sentTime, setSentTime] = useState(Date.now());
  const [sends, setSends] = useState(null);
  const [prolific, setProlific] = useState(null);
  const [experimentDateTime, setExperimentDateTime] = useState(expNode);

  // Get all jatos related variables here
  if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);        
  } 
  else if (window.attachEvent) {
      window.attachEvent("onmessage", onMessage, false);
  }

  function onMessage(event) {
    // Check sender origin to be trusted
    if (event.origin !== `${constants.ec2Base}:9000`) return;
    setProlific(event.data.message);
  }

   // Set up the socket in a useEffect with nothing in the dependency array,
  // to avoid setting up multiple connections.
  useEffect(() => {
    socket.once('connection', (data) => {
      console.log("My ID:", socket.id);
      console.log("my index:", data.count);
      console.log(`I'm connected with the back-end in room ${data.room}`);
      alert("You are Subject "+data.count);
      setSubject(data.count + 1);
      setRoom(data.room);
      // setExperimentDateTime(expNode);
    });
  },[])


  useEffect(()=> {
    // If the client is the first member in their room, initialize a firebase Node for the room to write to.
    socket.on('setNode', (data) => {
      console.log("setNode", data);
      console.log("expDate",experimentDateTime)
      setExperiment(experimentDateTime+`-`+JSON.stringify(data));
    })
  },[])

  useEffect(() => {
    // If the client is the second member in their room, get the firebase Node that was already initialized.
    socket.on('getNode', (data) => {
      console.log("getNode", data);
      console.log("expDate",experimentDateTime)
      setExperiment(experimentDateTime+`-`+JSON.stringify(data));
    })
  },[])


  useEffect(()=> {
    const timer = setTimeout(() => {
      if (prompt < constants.prompts.length-1) {
        // When the time is up, increment the prompt state variable.
        setPrompt(prompt + 1);
      }
      // Time length of prompt 
    }, constants.prompts[prompt].promptTime);
    return () => {
      clearTimeout(timer);
    };
    // The warning and timer Timeout(s) will run once every time the prompt changes.
  },[prompt])


 
  
  // The keystrokes variable is how we will store the write location on keydowns
  // and write to the same location on key ups.
  const [keystrokes, setKeystrokes] = useState({});

  useEffect(() => {
    window.onkeydown = async function (e) {
      const info = {
        "keyupordown": "down",
        "eCode": e.code, 
        "eKey": e.key, 
        "eKeyCode": e.keyCode, 
        "timestamp": Date.now(),
        "existingTextMessage": message,
        "visibleTextKeystroke": null
      }
      if (experiment != null) {
        // Map the keystroke to its latest firebase node.
        setKeystrokes(Object.assign(keystrokes, {[e.code]: firebase.database().ref('prod/' + experiment + '/prompt' + constants.prompts[prompt].promptNum + '/subject' +  subject + '/keys').push().key}));
        // Write the info object to that location.
        firebase.database().ref('prod/' + experiment + '/prompt' + constants.prompts[prompt].promptNum + '/subject'  + subject + '/keys/' + keystrokes[[e.code]]).push(info); 
        console.log("After down: ", keystrokes)
      }
    }
    window.onkeyup = async function (e) {
      const info = {
        "keyupordown": "up",
        "eCode": e.code, 
        "eKey": e.key, 
        "eKeyCode": e.keyCode, 
        "timestamp": Date.now(),
        "existingTextMessage": message,
        "visibleTextKeystroke": (e.key.length === 1 || e.code === "Backspace" ? e.key : null),
      }
      if (experiment != null) {
        // Retrieve the latest firebase node for the given keystroke.
        // Write the info object to that location.

        firebase.database().ref('prod/' + experiment + '/prompt' + constants.prompts[prompt].promptNum + '/subject'  +  subject + '/keys/' + keystrokes[[e.code]]).push(info).then(() => {
          console.log("In the middle: ", keystrokes);
          // Erase the association between the pressed key and specific firebase node
          setKeystrokes(Object.assign(keystrokes, {[e.code]: null}));
        }).then(() => {
          console.log("After up: ", keystrokes);
        })
      }
    }
  })


  useEffect(()=> {
    if (sends != null && sends.from === subject) {
      // "Sends" is an object storing the information for chats about to be sent. 
      firebase.database().ref('prod/' + experiment + '/prompt' + constants.prompts[prompt].promptNum + '/subject' + subject + '/sends').push(sends)
    }
  },[sends])

  useEffect(()=> {
    if (subject === 1) {
      // If the subject is the second person in the room (subject 1), get the current room number from the server
      // So that both subjects write to the same location in firebase
      let myKey = firebase.database().ref('prod').push().key;
      socket.emit('setNode', {signal: myKey, room: room });
    } else {
      // If the subject is the first person in the room (subject 0), get a new room number that the next subject that
      // enters the room can use.
      socket.emit('getNode', {room: room});
    }
  },[subject, room])


  // When more messages than visible in the chat interface can be shown,
  // The chat will automatically scroll to the latest chat on send / unless the user scrolls up
  function updateScroll(){
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
  }

  useEffect(() => { 
    if (subject != null) {
      socket.on("message", (result) => {
        console.log(`result.user: ${result.user}`);
        console.log(`subject number: ${subject}`);
        console.log("received: ", Date.now())
        const data = {
          "from": result.user,
          "timeSent": sentTime,
          "timeReceived": Date.now(),
          "message": result.data
        }
        setSends(data);
        // When the socket receives a message, it has to know if this message was sent by
        // a different client or itself.
        // Based on the identity of the sender it will render an appropriately styled chat box
        // Controlled by CSS classes.
        if (result.user === subject) {
          console.log("same")
          document.getElementById('messages').innerHTML += 
          ` 
            <div class="o-out band">
              <div class="o-in message">${result.data}</div>
            </div>
          `
        } else {
          console.log("different")
          document.getElementById('messages').innerHTML += 
          ` 
            <div class="m-out band">
              <div class="m-in message">${result.data}</div>
            </div>
          `
        }
        updateScroll();
      })
    }
  },[subject])

  useEffect(()=> {
    // This is the enter button that sends a message.
    window.onkeypress = function (e) {
      if (e.code === "Enter") {
        sendMessage(message)
      }
    }
  },[message])
  
  // Sends the message that is currently stored in the message state variable and
  // resets that variable.
  function sendMessage (message) {
    document.getElementById("text-input").value = "";
    setMessage("");
    if (message !== "") {
      setSentTime(Date.now());
      socket.emit("message", {signal: {user: subject, data: message}, room: room});
    } else {
      console.log("empty message:", Date.now())
    }
  }

  // end study and redrect
  useEffect(()=> {
    if (prompt >= constants.prompts.length-1) {
      console.log('Done with prompts');
      window.location.href = "https://forms.gle/ipvyLHKwNCFLnNsN8"
      // After the last prompt, signal the parent frame to run jatos.endStudyAndRedirect,
      // Which will redirect the user to Prolific's page and end the study.
      // The code logic for the redirect can be found in ./redirect.html. 
      // window.parent.postMessage({
      //   'func': 'parentFunc',
      //   'message': 'Redirecting...'
      // }, "http://ec2-18-223-160-60.us-east-2.compute.amazonaws.com:9000");
    }
  },[prompt])

  // useEffect(()=> {
  //   console.log("Experiment:", experiment)
  // },[experiment])

  // This is the JSX (React's version of HTML) structure of the chat interface
  return (
    // There will never be 3 people in a room.
    subject >= 3 ? <div>ERROR</div> : 
    <div className="app">
      <div className="chatbox">
        <div id="messages" className="messages">
          
        </div>
        <div className="bar">
          <div className="type">
            <input type="text" id="text-input" className="text-input" onChange={(e) => {
              setMessage(e.target.value)            
            }}>
            </input>
          </div>
          {/* Button code below. */}
          {/* <div className="send-btn" onClick={() => sendMessage(message)}></div> */}
        </div>
      </div>
      <div className="prompt">
        {/* Display the prompt based on which prompt you're on: */}
        <div style={{margin: "50px"}}>{constants.prompts[prompt].promptText}</div>
      </div>
    </div>
  );
}

export default App;