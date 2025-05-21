let questions = [];
let currentIndex = 0;
let currentQuestions = [];
let score = { r: 0, g: 0, b: 0 };
let colorCounts = { r: 0, g: 0, b: 0 };
let selectedCount = 0;
const questionsPerDifficulty = 1; // adjustable for scaling

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('intro-container').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    fetch('questions.json')
        .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
        })
        .then(data => {
        questions = data.questions;
        currentQuestions = getBalancedQuestions(questions);
        countColorTargets(currentQuestions);
        showQuestion(currentIndex);
        })
        .catch(err => {
        console.error("Failed to load questions.json:", err);
        document.getElementById("question-text").textContent = "Error loading questions. Check console.";
        });
});

function countColorTargets(questions) {
    colorCounts = { r: 0, g: 0, b: 0 };
    for (const q of questions) {
        if (q.color === 'red') colorCounts.r++;
        if (q.color === 'green') colorCounts.g++;
        if (q.color === 'blue') colorCounts.b++;
    }
}

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

    imgEl.style.display = q.image ? 'block' : 'none';
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

    const colorScore = { r1: 0, r2: 0, g1: 0, g2: 0, b1: 0, b2: 0 };
    colorScore.r1 = colorCounts.r > 0 ? Math.round((score.r / colorCounts.r) * 255 / 100) : 0;
    colorScore.g1 = colorCounts.g > 0 ? Math.round((score.g / colorCounts.g) * 255 / 100) : 0;
    colorScore.b1 = colorCounts.b > 0 ? Math.round((score.b / colorCounts.b) * 255 / 100) : 0;
    colorScore.r2 = Math.round((score.r / (currentQuestions.length * 3)) * 255 / 100);
    colorScore.g2 = Math.round((score.g / (currentQuestions.length * 3)) * 255 / 100);
    colorScore.b2 = Math.round((score.b / (currentQuestions.length * 3)) * 255 / 100);
    const hex = `#${toHex(colorScore.r2)}${toHex(colorScore.g2)}${toHex(colorScore.b2)}`;
    const intensity = Math.round(((colorScore.r1 + colorScore.g1 + colorScore.b1) / (3 * 255)) * 100);
  
    container.style.display = 'none';
    resultBox.style.display = 'block';
    colorBox.style.backgroundColor = hex;
    hexDisplay.textContent = `Hexcode: ${hex}`;
    intensityDisplay.textContent = `Intensity: ${intensity}%`;

    document.getElementById('restart-btn').addEventListener('click', () => {
        location.reload();
    });
}

function toHex(n) {
    return n.toString(16).padStart(2, '0').toUpperCase();
}
