const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const resultContainer = document.querySelector(".result-container");
const categoryButtons = [...document.querySelectorAll(".category-options .category-option")];
const questionNumberButtons = [...document.querySelectorAll(".question-options .category-option")];
const startQuizBtn = document.querySelector(".start-quiz-btn");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const tryAgainBtn = document.querySelector(".try-again-btn");
const questionText = document.querySelector(".question-text");
const answerOptions = document.querySelector(".answer-options");
const questionStatus = document.querySelector(".question-status");
const timeDuration = document.querySelector(".time-duration");
let selectedCategory = "Programming";
let selectedNumber = 10;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timePerQuestion = 15;
let timeLeft = timePerQuestion;
let acceptingAnswers = false;
const categoriesMap = {
  Programming: 18,
  "Science & Nature": 17,
  Mathematics: 19,
  "General Knowledge":9,
  Geography: 22,
  History:23,
  Sports:21,
  Books:10,
  Mythology:20,
  Entertainments:11
};
function decodeHTML(html) {                                                   //For  To decode HTML entities from Trivia DB API questions
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
function startTimer() {
  timeLeft = timePerQuestion;
  timeDuration.textContent = `${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timeDuration.textContent = `${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      acceptingAnswers = false;
      showCorrectAnswer();
      nextQuestionBtn.style.display = "inline-flex";
    }
  }, 1000);
}
function resetTimer() {
  clearInterval(timer);
  timeDuration.textContent = `${timePerQuestion}s`;
}
function showConfig() {
  configContainer.style.display = "block";
  quizContainer.style.display = "none";
  resultContainer.style.display = "none";
}
function showQuiz() {
  configContainer.style.display = "none";
  quizContainer.style.display = "block";
  resultContainer.style.display = "none";
}
function showResult() {
  configContainer.style.display = "none";
  quizContainer.style.display = "none";
  resultContainer.style.display = "block";
  const correctCount = score;
  const totalCount = questions.length;
  resultContainer.querySelector(".result-message").innerHTML = `You answered <b>${correctCount}</b> out of <b>${totalCount}</b> questions correctly.<br>Great effort!`;
}
function fetchQuestions() {
  const categoryId = categoriesMap[selectedCategory] || 18;
  const url = `https://opentdb.com/api.php?amount=${selectedNumber}&category=${categoryId}&type=multiple`;
  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.response_code !== 0) {
        alert("Failed to fetch questions. Please try again.");
        return [];
      }
      return data.results.map((q) => {
        const answers = [...q.incorrect_answers];
        const correctIndex = Math.floor(Math.random() * (answers.length + 1));
        answers.splice(correctIndex, 0, q.correct_answer);
        return {
          question: decodeHTML(q.question),
          answers: answers.map((a) => decodeHTML(a)),
          correctAnswerIndex: correctIndex,
        };
      });
    });
}
function showQuestion(index) {
  acceptingAnswers = true;
  nextQuestionBtn.style.display = "none";
  const q = questions[index];
  questionText.textContent = q.question;
  answerOptions.innerHTML = "";
  q.answers.forEach((answer, i) => {
    const li = document.createElement("li");
    li.classList.add("answer-option");
    li.textContent = answer;
    li.dataset.index = i;
    li.addEventListener("click", selectAnswer);
    answerOptions.appendChild(li);
  });
  questionStatus.innerHTML = `<b>${index + 1}</b> of <b>${questions.length}</b> Questions`;
  resetTimer();
  startTimer();
}
function selectAnswer(e) {
  if(!acceptingAnswers) return;
  acceptingAnswers=false;
  clearInterval(timer);
  const selectedLi = e.currentTarget;
  const selectedIndex = Number(selectedLi.dataset.index);
  const currentQuestion = questions[currentQuestionIndex];
  if (selectedIndex === currentQuestion.correctAnswerIndex) {
    selectedLi.classList.add("correct");
    score++;
  } else {
    selectedLi.classList.add("incorrect");
  }
  if (selectedIndex !== currentQuestion.correctAnswerIndex) {                     //  For Show correct answer if user chose wrong
    showCorrectAnswer();
  }
  nextQuestionBtn.style.display = "inline-flex";
}
function showCorrectAnswer() {
  const currentQuestion = questions[currentQuestionIndex];
  const answerLis = answerOptions.querySelectorAll("li");
  answerLis.forEach((li) => {
    li.removeEventListener("click", selectAnswer);
    if (Number(li.dataset.index)===currentQuestion.correctAnswerIndex) {
      li.classList.add("correct");
    }
  });
}
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex>=questions.length) {
    showResult();                                                // For Quiz finished
  } else {
    showQuestion(currentQuestionIndex);
  }
}
categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory = btn.textContent.trim();
  });
});
questionNumberButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    questionNumberButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedNumber = Number(btn.textContent.trim());
  });
});
startQuizBtn.addEventListener("click", async () => {                                      //For  Start quiz
  score = 0;
  currentQuestionIndex = 0;
  questions = [];
  startQuizBtn.disabled = true;
  startQuizBtn.textContent = "Loading...";
  questions = await fetchQuestions();
  startQuizBtn.disabled = false;
  startQuizBtn.textContent = "Start Quiz";
  if (questions.length > 0) {
    showQuiz();
    showQuestion(currentQuestionIndex);
  }
});
nextQuestionBtn.addEventListener("click", () => {
  nextQuestion();
});
tryAgainBtn.addEventListener("click", () => {
  showConfig();
});
showConfig();
