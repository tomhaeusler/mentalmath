document.addEventListener('DOMContentLoaded', async () => {
  await loadKaTeX();
  const startButton = document.getElementById('startSession');
  const exerciseOutput = document.getElementById('exerciseOutput');
  const difficultySelect = document.getElementById('difficulty'); // Ensure this matches your HTML
  let timerDisplay = document.createElement('div');
  document.getElementById('sessionControls').appendChild(timerDisplay);

  let answers = [];
  let correctAnswers = [];
  let sessionTime = 60;
  let selectedOperations = [];
  let exerciseTimer;

  startButton.addEventListener('click', async () => {
      const exerciseOptions = document.querySelectorAll('#exerciseOptions input[type="checkbox"]:checked');
      selectedOperations = Array.from(exerciseOptions).map(option => option.value);
      if (selectedOperations.length === 0) {
          alert('Please select at least one type of exercise.');
          return;
      }
      document.getElementById('exerciseOptions').style.display = 'none';
      startButton.style.display = 'none';
      startCountdown(3);
  });

  function getNumberRange(difficulty) {
      switch (difficulty) {
          case 'easy':
              return { min: 1, max: 10 };
          case 'medium':
              return { min: 11, max: 50 };
          case 'hard':
              return { min: 51, max: 100 };
          default:
              return { min: 1, max: 10 };
      }
  }

  function generateNumber({ min, max }) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function startCountdown(seconds) {
      exerciseOutput.innerHTML = `Starting in ${seconds}...`;
      if (seconds > 0) {
          setTimeout(() => startCountdown(seconds - 1), 1000);
      } else {
          startExercisesSession();
      }
  }

  async function startExercisesSession() {
      exerciseOutput.innerHTML = '';
      updateTimerDisplay(sessionTime);
      exerciseTimer = setInterval(() => {
          sessionTime--;
          updateTimerDisplay(sessionTime);
          if (sessionTime <= 0) {
              clearInterval(exerciseTimer);
              endSession();
          }
      }, 1000);
      generateExercise();
  }

  async function generateExercise() {
      await loadKaTeX(); // Ensure KaTeX is loaded
      const operation = selectedOperations[Math.floor(Math.random() * selectedOperations.length)];
      const difficulty = difficultySelect ? difficultySelect.value : 'easy';
      const numberRange = getNumberRange(difficulty);
      let solution, latexQuestion = "";

      switch (operation) {
          case 'add':
              const addNum1 = generateNumber(numberRange);
              const addNum2 = generateNumber(numberRange);
              solution = addNum1 + addNum2;
              latexQuestion = `${addNum1} + ${addNum2}`;
              break;
          case 'subtract':
              const subNum1 = generateNumber(numberRange);
              const subNum2 = generateNumber(numberRange);
              solution = subNum1 - subNum2;
              latexQuestion = `${subNum1} - ${subNum2}`;
              break;
          case 'multiply':
              const mulNum1 = generateNumber(numberRange);
              const mulNum2 = generateNumber(numberRange);
              solution = mulNum1 * mulNum2;
              latexQuestion = `${mulNum1} \\times ${mulNum2}`;
              break;
          case 'divide':
              const divNum1 = generateNumber(numberRange);
              let divNum2 = generateNumber(numberRange);
              // Ensure divNum2 is not 0
              divNum2 = divNum2 === 0 ? 1 : divNum2;
              solution = divNum1;
              latexQuestion = `\\frac{${divNum1 * divNum2}}{${divNum1}}`;
              break;
          case 'root':
              const rootNum = generateNumber(numberRange);
              solution = rootNum;
              latexQuestion = `\\sqrt{${rootNum * rootNum}}`;
              break;
      }

      exerciseOutput.innerHTML = `<div id="latexQuestion"></div>
                                  <input type="text" id="userAnswer" autofocus />
                                  <button id="submitAnswer">Submit</button>`;

      katex.render(latexQuestion, document.getElementById('latexQuestion'), {
          throwOnError: false
      });

      document.getElementById('userAnswer').focus();

      document.getElementById('userAnswer').addEventListener('keypress', function(event) {
          if (event.key === "Enter") {
              event.preventDefault();
              submitAnswer(solution);
          }
      });
      document.getElementById('submitAnswer').addEventListener('click', () => submitAnswer(solution));
  }

  function submitAnswer(correctSolution) {
      const userAnswer = parseFloat(document.getElementById('userAnswer').value);
      if (userAnswer === correctSolution) {
          answers.push('Correct');
          correctAnswers.push(1);
      } else {
          answers.push(`Incorrect, the correct answer was: ${correctSolution}`);
      }
      if (sessionTime > 0) generateExercise();
  }

  function endSession() {
      exerciseOutput.innerHTML = `<h3>Session Ended</h3>
                                  <p>You got ${correctAnswers.length} out of ${answers.length} correct.</p>
                                  <div>${answers.join('<br>')}</div>
                                  <button onclick="window.location.reload();">Restart</button>`;
  }

  function updateTimerDisplay(time) {
      timerDisplay.textContent = `Time Remaining: ${time} seconds`;
  }

  async function loadKaTeX() {
      if (typeof katex === "undefined") {
          const katexScript = document.createElement("script");
          katexScript.src = "https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.js";
          document.head.appendChild(katexScript);

          return new Promise((resolve) => {
              katexScript.onload = () => {
                  console.log("KaTeX loaded.");
                  resolve();
              };
          });
      }
  }
});
