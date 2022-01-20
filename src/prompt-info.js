
/* JSX strings need to be wrapped in parent (div?) tags */
const prompt0Text = (
  <div> 
   <p style={{fontSize:'25px'}}>Waiting for your partner, Pat, to join...</p>
   <p style={{color:'red',fontSize:'18px'}}><strong>*PLEASE DO NOT ENTER ANY TEXT. IT WILL NOT BE SEEN.*</strong></p>
   <p>If your partner does not join after 10 minutes, please exit the wondow, return the study, and message the researchers on Prolific.</p>
  </div>
);

const prompt1Text = (
  <div>
    <ul>
      <li>
        Pat, first get to know Alex's tastes. What kinds of movies or TV shows do they like and dislike?
        If you agree or disagree, why do you feel that way?
      </li>
      <li>
        Do not hesitate to express strong opinions, about genres, actors, etc. you especially like or don’t like.
        Thoroughly engaging with your partner is the whole point, so have fun! 
      </li>
      <li>
        You will have 8 minutes to discuss the prompt below, and a warning will appear when there is 1 minute left.
        Please make sure to make FULL use of ALL 8 minutes.
        Keep the conversation active and lively!
      </li>
    </ul>
      <p style={{backgroundColor:'gainsboro',
                fontWeight:'bold',
                fontStyle:'italic',
                textAlign:'center',
                fontSize:'23px'}}>
        Alex has had a long week at work, and would like to relax and watch a movie or TV show to unwind. 
        Pat, what movies or TV shows would you recommend and why?
      </p>
  </div>
);

const prompt2Text = (
  <div>
    <ul>
      <li>
        Alex, now get to know Pat's tastes first. What kinds of movies or TV shows do they like and dislike?
      </li>
      <li>
        Do not hesitate to express strong opinions, about genres, actors, etc. you especially like or don’t like.
        Thoroughly engaging with your partner is the whole point, so have fun!
      </li>
      <li>
        You will have 8 minutes to discuss the prompt below, and a warning will appear when there is 1 minute left.
        Please make sure to make FULL use of ALL 8 minutes.
      </li>
    </ul>
      <p style={{backgroundColor:'gainsboro',
                fontWeight:'bold',
                fontStyle:'italic',
                textAlign:'center',
                fontSize:'23px'}}>
        Pat is bored, and would like to watch a really thought-provoking or stimulating movie or TV show. 
        Alex, what movies or TV shows would you recommend and why?
      </p>
  </div>
);

// const prompt0Text = `Waiting for your partner, Pat, to join...
// \n*PLEASE DO NOT ENTER ANY TEXT. IT WILL NOT BE SEEN.*
// \n\nIf your partner does not join after 5 minutes, please exit the study and email movie-study@u.northwestern.edu.`

// const prompt1Text = `Alex has had a long week at work, and would like to relax and watch a movie or TV show to unwind. Pat, what movies or TV shows would you recommend and why?
// \nFeel free to get to know each other and your tastes in movies/TV. Do not hesitate to express opinions, for example about what you like or don’t like about certain movies or movie genres. Try your best to not provide any “spoilers” about a movie, and ruin it for the other person.
// \nYou will have 8 minutes to discuss this, and a warning will appear when there is only 1 minute left.`;

// const prompt2Text = `Pat is bored, and would like to watch a really thought-provoking or stimulating movie or TV show. Alex, what movies or TV shows would you recommend and why?
// \nDo not hesitate to express opinions, for example about what you like or don’t like about certain movies or TV shows, or certain actors and actresses. Try your best to not provide any “spoilers” about a movie, and ruin it for the other person.
// \nYou will have 7 minutes to discuss this, and a warning will appear when there is only 1 minute left.`;

const warningText = `You have 1 minute left on this section...`

function minsToMS(mins) {
  return mins * 60000;
}

// This is the array of prompts that will be displayed to the experiment subjects.
// The 'Finished...' prompts are so that the 2nd half of the 2nd prompt will show for the
// alotted period of time
export const prompts = [
    {promptNum:0, promptText: prompt0Text, promptTime:5000},
    {promptNum:0, promptText:`Setting up experiment`, promptTime:5000}, // add this to avoid NaN in CountDown
    {promptNum:1, promptText: prompt1Text, promptTime:minsToMS(7)}, // real exp - 15 mins
    // {promptNum:1, promptText: prompt1Text, promptTime:minsToMS(4)}, // pilot - 10 mins
    // {promptNum:1, promptText: prompt1Text, promptTime:minsToMS(0.5)}, // test - 30 secs
    {promptNum:1, promptText: warningText, promptTime:10000},
    {promptNum:1, promptText: prompt1Text, promptTime:45000}, // real exp
    // {promptNum:1, promptText: prompt1Text, promptTime:(50*1000)}, // pilot
    {promptNum:1, promptText: `CHANGING PROMPTS`, promptTime:3000},
    {promptNum:2, promptText: prompt2Text, promptTime:minsToMS(7)}, // real exp
    // {promptNum:2, promptText: prompt2Text, promptTime:minsToMS(4)}, // pilot
    // {promptNum:2, promptText: prompt2Text, promptTime:minsToMS(0.5)}, // test - 30 secs
    {promptNum:2, promptText: warningText, promptTime:10000},
    {promptNum:2, promptText: prompt2Text, promptTime:48000}, // real exp
    // {promptNum:2, promptText: prompt2Text, promptTime:(50*1000)}, // pilot
    {promptNum:3, promptText:`Finished...redirecting`, promptTime:5000},
    {promptNum:3, promptText:`Finished...redirecting`, promptTime:5000}
  ]