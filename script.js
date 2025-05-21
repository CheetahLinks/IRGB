let questions = [];
let currentIndex = 0;
let currentQuestions = [];
let score = { r: 0, g: 0, b: 0 };
let selectedCount = 0;
const questionsPerDifficulty = 1; // adjustable for scaling

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('intro-container');
  document.getElementById('question-container');
  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questions = data.questions;
      currentQuestions = getBalancedQuestions(questions);
      showQuestion(currentIndex);
    });
});

function getBalancedQuestions(questions) {
  const colors = ['red', 'green', 'blue'];
  const difficulties = ['easy', 'medium', 'hard'];
  let selected = [];

  for (let d of difficulties) {
    for (let c of colors) {
      const pool = questions.filter(q => q.color === c && q.weight === d);
      if (pool.length > 0) {
        const sample = pool[Math.floor(Math.random() * pool.length)];
        selected.push(sample);
      }
    }
  }
  return selected;
}

function showQuestion(index) {
  const q = currentQuestions[index];
  const imgEl = document.getElementById('question-image');
  const textEl = document.getElementById('question-text');
  const answersEl = document.getElementById('answer-buttons');
  const nextBtn = document.getElementById('next-btn');

  imgEl.src = q.image || '';
  textEl.textContent = q.text;
  answersEl.innerHTML = '';
  nextBtn.disabled = true;

  q.answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.textContent = ans.text;
    btn.className = 'answer-btn';
    btn.onclick = () => {
      score.r += ans.rgb[0];
      score.g += ans.rgb[1];
      score.b += ans.rgb[2];
      document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
      btn.classList.add('selected');
      nextBtn.disabled = false;
    };
    answersEl.appendChild(btn);
  });
}

document.getElementById('next-btn').addEventListener('click', () => {
  currentIndex++;
  if (currentIndex < currentQuestions.length) {
    showQuestion(currentIndex);
  } else {
    showResult();
  }
});

function showResult() {
  const container = document.getElementById('question-container');
  const resultBox = document.getElementById('result');
  const colorBox = document.getElementById('color-box');
  const hexDisplay = document.getElementById('hex-display');
  const intensityDisplay = document.getElementById('intensity-display');

  const total = currentQuestions.length;
  const R = Math.round((score.r / total) * 255 / 100);
  const G = Math.round((score.g / total) * 255 / 100);
  const B = Math.round((score.b / total) * 255 / 100);
  const hex = `#${toHex(R)}${toHex(G)}${toHex(B)}`;
  const intensity = Math.round(((R + G + B) / (3 * 255)) * 100);

  colorBox.style.backgroundColor = hex;
  hexDisplay.textContent = `Hexcode: ${hex}`;
  intensityDisplay.textContent = `Intensity: ${intensity}%`;
}

function toHex(n) {
  return n.toString(16).padStart(2, '0').toUpperCase();
}
