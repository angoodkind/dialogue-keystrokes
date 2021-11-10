export const firebaseConfig = {

    apiKey: "AIzaSyBWJmpNZvlexkgSRvCi9IGe4ZZFGgaE9sc",
    authDomain: "keystroke-dialogue.firebaseapp.com",
    projectId: "keystroke-dialogue",
    storageBucket: "keystroke-dialogue.appspot.com",
    messagingSenderId: "258869565916",
    appId: "1:258869565916:web:a5388f1b8ec7ee25709719"
  };

export const ec2Base = 'http://ec2-18-223-160-60.us-east-2.compute.amazonaws.com'

const prompt1Text = `Alex has had a long week at work, and would like to relax and watch a movie to unwind. Pat, what movie or movies would you recommend and why?
\nFeel free to get to know each other, your tastes in movies, and discuss why you’ve recommended these movies. Do not hesitate to express opinions, for example about what you like or don’t like about certain movies or movie genres, or certain actors and actresses. Try your best to not provide any “spoilers” about a movie, and ruin it for the other person.
\nYou will have 7 minutes to discuss this, and a warning will appear when there is only 1 minute left.`;

const prompt2Test = `Pat is bored, and would like to watch a really thought-provoking or stimulating movie. Alex, what movie or movies would you recommend and why?
\nAgain, feel free to get to learn more about each other, your tastes in movies, and discuss why you’ve recommended these movies. Do not hesitate to express opinions, for example about what you like or don’t like about certain movies or movie genres, or certain actors and actresses. Try your best to not provide any “spoilers” about a movie, and ruin it for the other person.
\nYou will have 7 minutes to discuss this, and a warning will appear when there is only 1 minute left.`;

const warningText = `You have 1 minute left on this section...`

function minsToMS(mins) {
  return mins * 60000;
}

// This is the array of prompts that will be displayed to the experiment subjects.
// The 'Finished...' prompts are so that the 2nd half of the 2nd prompt will show for the
// alotted period of time
export const prompts = [
    {promptNum:0, promptText: `Waiting for your partner, Pat, to join...\n*PLEASE DO NOT ENTER ANY TEXT*`, promptTime:5000},
    {promptNum:1, promptText: prompt1Text, promptTime:minsToMS(1)},
    {promptNum:1, promptText: warningText, promptTime:10000},
    {promptNum:1, promptText: prompt1Text, promptTime:minsToMS(1)},
    {promptNum:2, promptText: prompt2Test, promptTime:minsToMS(1)},
    {promptNum:2, promptText: warningText, promptTime:10000},
    {promptNum:2, promptText: prompt2Test, promptTime:minsToMS(1)},
    {promptNum:3, promptText:`Finished...redirecting`, promptTime:3000},
    {promptNum:3, promptText:`Finished...redirecting`, promptTime:3000}
  ]