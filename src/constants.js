export const firebaseConfig = {

    apiKey: "AIzaSyBWJmpNZvlexkgSRvCi9IGe4ZZFGgaE9sc",
    authDomain: "keystroke-dialogue.firebaseapp.com",
    projectId: "keystroke-dialogue",
    storageBucket: "keystroke-dialogue.appspot.com",
    messagingSenderId: "258869565916",
    appId: "1:258869565916:web:a5388f1b8ec7ee25709719"
  };

export const ec2Base = 'http://ec2-18-223-160-60.us-east-2.compute.amazonaws.com'

// This is the array of prompts that will be displayed to the experiment subjects.
// The 'Finished...' prompts are so that the 2nd half of the 2nd prompt will show for the
// alotted period of time
export const prompts = [
    {promptNum:0, promptText: `waiting`, promptTime:5000},
    {promptNum:1, promptText:`Prompt 1`, promptTime:5000},
    {promptNum:1, promptText:`warning1`, promptTime:3000},
    {promptNum:1, promptText:`Prompt 1`, promptTime:10000},
    {promptNum:2, promptText:`Prompt 2`, promptTime:10000},
    {promptNum:2, promptText:`warning2`, promptTime:3000},
    {promptNum:2, promptText:`Prompt 2`, promptTime:10000},
    {promptNum:3, promptText:`Finished...redirecting`, promptTime:3000},
    {promptNum:3, promptText:`Finished...redirecting`, promptTime:3000}
  ]