import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/database';
import * as constants from './constants';
import $ from "jquery"; // For using jquery-confirm
import 'jquery-confirm'; // for customizable alert popup
import "jquery-confirm/dist/jquery-confirm.min.css";
import Countdown, {zeroPad} from 'react-countdown';

// Changes when 2nd subject joins, so that timers are in sync
var readyForTimer = false;

var nodeName = null;

var roomName = "";

// set the experiment start time if readyForInterval = true, which means both subjects
// have joined. Use this in the Countdown in JSX
var experimentStartTime = "";

// for isTyping indicator
var typingTimeout = null;

// Must configure firebase before using its services
firebase.initializeApp(constants.firebaseConfig);

// Open a connection to the socket.io server 
const socket = openSocket(`${constants.ec2Base}:8080`, {rejectUnauthorized: false, transports: ['websocket']});

function App() {

  // These are React variables that control the state of the app. 
  const [subject, setSubject] = useState(null);
  const [room, setRoom] = useState();
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState(0); // start with 'waiting...' prompt
  const [experiment, setExperiment] = useState(null);
  const [sentTime, setSentTime] = useState(Date.now());
  const [sends, setSends] = useState(null);
  const [prolific, setProlific] = useState(null);
  const [prolificID, setProlificID] = useState(null);
  // const [experimentNodeName, setExperimentNodeName] = useState();

  // Received from backend only when 2nd person joins
  // `readyForTimer` is the name of the socket and the var (change later)
  useEffect(()=> {
    socket.on('readyForTimer', (data) => {
      // console.log("readyForTimer", room, data);
      readyForTimer = true;
    })
  },[room])

  // check is readyForTimer every 1 ms
  // one 2nd person joins, clear the interval, set the date/time stamp, and advance the
  // prompt to the first real prompt that both subjects see
  useEffect(() => {
    if (prompt == 0 ) {
      var dateInterval = setInterval(function(){
        if (readyForTimer){
          clearInterval(dateInterval);
          const d = new Date();  
          const expDate = d.toLocaleDateString('en-US').replace(/\//g,'-'); // replace all /'s with -'s
          // const expTime = d.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}); //24-hour time format
          // const expNode = expDate+`_`+expTime;
          // setExperimentNodeName(expNode);
          nodeName = expDate+`-`+roomName;
          console.log('Setting Node Name',nodeName);
          setPrompt(prompt+1);
          experimentStartTime = Date.now();
        }
      }, 1);
    }
  },[prompt])


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
      console.log("data",JSON.stringify(data));
      console.log("My ID:", socket.id);
      console.log("my index:", data.count);
      console.log(`I'm connected with the back-end in room ${data.room}`);
      // data.count is the equivalent of subject #, either 0 or 1
      const subjName = data.count == 0 ? `Alex` : `Pat`;
      const otherName = data.count == 0 ? `Pat` : `Alex`;
      $.confirm({
        title: 'Prolific ID',
        width: 'auto',
        boxWidth: '30%',
        useBootstrap: false, // Need this line to set width
        content: '' +
        '<form action="" class="formName">' +
          '<div class="form-group">' +
            '<label>(For Internal Use Only)</label>' +
            '</br></br>' +
            '<input type="text" placeholder="Prolific ID" class="name form-control" required />' +
          '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
                text: 'Submit',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('.name').val();
                    if(!name){
                        $.alert({
                          content: 'Please provide a valid Prolific ID',
                          width: 'auto',
                          // boxWidth: '30%',
                          useBootstrap: false // Need this line to set width
                        });
                        return false;
                    }
                    setProlificID(name);
                    // $.alert('Your SubjID is ' + subject + '_' + name);
                    $.alert({
                      title: 'Welcome!',
                      content: `For this conversation, your name will be ${subjName}. <br> \
                      Your partner's name will be ${otherName}.`,
                      width: 'auto',
                      // boxWidth: '30%',
                      useBootstrap: false // Need this line to set width
                  });
                }
            },
            // cancel: function () {
            //     return false;
            // },
        },
        onContentReady: function () {
            // bind to events
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                // if the user submits the form by pressing enter in the field.
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); // reference the button and click it
            });
        }
      }); // end confirm box

      setSubject(data.count + 1);
      setRoom(data.room);
      console.log('checking room', data.room)
      roomName = data.room;
    });
  },[])


  useEffect(()=> {
    // If the client is the first member in their room, initialize a firebase Node for the room to write to.
    socket.on('setNode', (data) => {
      console.log("setNode", data);
      setExperiment(nodeName);
    })
  },[])

  useEffect(() => {
    // If the client is the second member in their room, get the firebase Node that was already initialized.
    socket.on('getNode', (data) => {
      console.log("getNode", data);
      setExperiment(nodeName);
    })
  },[])

  // only starts when prompt > 0, which only occurs when both subjects have joined
  useEffect(()=> {
    if (prompt > 0) {
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
    }
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
      if (nodeName != null && prolificID != null && constants.prompts[prompt].promptNum > 0) {
        // Map the keystroke to its latest firebase node.
        setKeystrokes(Object.assign(keystrokes, {[e.code]: firebase.database().ref('prod/' + nodeName + '/subject' +  subject+'_'+prolificID + '/prompt' + constants.prompts[prompt].promptNum + '/keys').push().key}));
        // Write the info object to that location.
        firebase.database().ref('prod/' + nodeName + '/subject' + subject+'_'+prolificID + '/prompt' + constants.prompts[prompt].promptNum + '/keys/' + keystrokes[[e.code]]).push(info); 
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
      if (nodeName != null && prolificID != null && constants.prompts[prompt].promptNum > 0) {
        // Retrieve the latest firebase node for the given keystroke.
        // Write the info object to that location.
        firebase.database().ref('prod/' + nodeName + '/subject'  +  subject+'_'+prolificID + '/prompt' + constants.prompts[prompt].promptNum + '/keys/' + keystrokes[[e.code]]).push(info).then(() => {
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
    if (sends != null && sends.from === subject && constants.prompts[prompt].promptNum > 0) {
      // "Sends" is an object storing the information for chats about to be sent. 
      firebase.database().ref('prod/' + nodeName + '/subject' + subject+'_'+prolificID + '/prompt' + constants.prompts[prompt].promptNum + '/sends').push(sends)
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

  // look for keypresses
  // - any keypress = typing indicator
  // - enter = send message
  useEffect(()=> {
    window.onkeypress = function (e) {
      if (e.code === "Enter") {
        sendMessage(message);
      }
      isTyping(e);
    }
  },[message])

  // isTyping indicator
  // receives from backend
  useEffect(()=> {
    socket.on('isTypingIndicator', (data) => {
      console.log('ks',data.ks);
        if (data.user != subject && subject) {
          document.getElementById("is-typing").classList.remove("hidden");
          // add a 2500 ms delay so it doesn't go away the moment they stop typing
          clearTimeout(typingTimeout);
          if (data.ks === "Enter") {
            document.getElementById("is-typing").classList.add("hidden");
          } else {
          typingTimeout = setTimeout(function(){
            document.getElementById("is-typing").classList.add("hidden");
          }, 2500)
        }}
        
    })
  },[subject])
  
  // Sends the message that is currently stored in the message state variable and
  // resets that variable.
  function sendMessage (message) {
    if (message !== "") {
      setSentTime(Date.now());
      socket.emit("message", {signal: {user: subject, data: message}, room: room});
    } else {
      console.log("empty message:", Date.now())
    }
    document.getElementById("text-input").value = "";
    setMessage("");
  }

  // sends to back
  function isTyping (e) {
    console.log('e', e, e.code)
    socket.emit("isTypingIndicator", {signal: {user: subject, data: message, ks: e.code}, room: room});
  }

  // end study and redrect
  useEffect(()=> {
    if (prompt >= constants.prompts.length-1) {
      console.log('Done with prompts');
      window.location.href = "https://forms.gle/ipvyLHKwNCFLnNsN8"
    }
  },[prompt])


  const renderer = ({ minutes, seconds }) => {
    // no timer before both subjects start
    if (constants.prompts[prompt].promptNum == 0) {
      return <span></span>;
    }
    // start timer when both subjects join (prompt moves to 1)
    return <span>Time left in experiment: {zeroPad(minutes)}:{zeroPad(seconds)}</span>;
  };
  
  
  // This is the JSX structure of the chat interface
  return (
    // There will never be 3 people in a room.
    subject >= 3 ? <div>ERROR</div> : 
    <div className="app">
      <div className="chatbox">
        <div id="messages" className="messages">
          
        </div>
        <div className="bar">
          <div className="type">
            <input type="text" id="text-input" className="text-input" 
            placeholder="Write here. Press 'Enter' key to send." 
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            onChange={(e) => {
              setMessage(e.target.value)            
            }}>
            </input>
          </div>
          {/* Button code below. */}
          {/* <div className="send-btn" onClick={() => sendMessage(message)}></div> */}
        </div>
        <div className='hidden' id='is-typing'>
          {subject == 1 ?
            'Pat is typing' :
            'Alex is typing'
          }
        </div>
      </div>
      <div className="promptbox">
          {/* a countdown timer that runs throughout the experiment*/}
          <div id="timer">
            {constants.prompts[prompt].promptNum == 0 ? 
              <span></span> : 
              <Countdown date={experimentStartTime + (16*60000)}
              renderer={renderer}
            />
            }
          </div>
          {/* Display the prompt based on which prompt you're on: */}
          <div id="prompttext">
            {constants.prompts[prompt].promptText}
          </div>
      </div>
    </div>
  );
}

export default App;