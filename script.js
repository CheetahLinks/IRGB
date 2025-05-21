let questions = [];
let currentIndex = 0;
let currentQuestions = [];
let score = { r: 0, g: 0, b: 0 };
let colorCounts = { r: 0, g: 0, b: 0 };
let selectedCount = 0;
let maxQuestions = 20;

const shortBtn = document.getElementById('short-btn');
const longBtn = document.getElementById('long-btn');

shortBtn.addEventListener('click', () => {
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

longBtn.addEventListener('click', () => {
    maxQuestions = 100;
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
    const selected = [];
    const usedIds = new Set();

    const pool = {};
    for (let d of difficulties) {
    for (let c of colors) {
        pool[`${d}_${c}`] = questions.filter(q => q.color === c && q.weight === d);
    }
    }
    outer: while (selected.length < maxQuestions) {
    for (let d of difficulties) {
        for (let c of colors) {
        const key = `${d}_${c}`;
        const available = pool[key].filter(q => !usedIds.has(q.id));
        if (available.length > 0) {
            const chosen = available[Math.floor(Math.random() * available.length)];
            selected.push(chosen);
            usedIds.add(chosen.id);
            if (selected.length >= maxQuestions) break outer;
        }
        }
    }
    if (Object.values(pool).every(qList => qList.length === 0)) break;
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
            document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            nextBtn.disabled = false;
        };
        answersEl.appendChild(btn);
    });
}

function submit() {
    const selectedBtn = document.querySelector('.answer-btn.selected');
    if (!selectedBtn) return;
    const selectedAnswer = currentQuestions[currentIndex].answers.find(
        a => a.text === selectedBtn.textContent
    );
    if (selectedAnswer) {
        score.r += selectedAnswer.rgb[0];
        score.g += selectedAnswer.rgb[1];
        score.b += selectedAnswer.rgb[2];
        selectedCount++;
    }
}

document.getElementById('next-btn').addEventListener('click', () => {
    submit()
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
    const intensityLabel = document.getElementById('intensity-label');
    const intensityComment = document.getElementById('intensity-comment');
    const colorLabel = document.getElementById('color-label');

    
    
    let label = "";
    let comment = "";

    const colorScore = { r1: 0, r2: 0, g1: 0, g2: 0, b1: 0, b2: 0 };
    const totalScore = score.r + score.g + score.b;
    const maxScore = (colorCounts.r + colorCounts.g + colorCounts.b) * 100;
    colorScore.r2 = Math.round((score.r / (currentQuestions.length)) * 255 / 100);
    colorScore.g2 = Math.round((score.g / (currentQuestions.length)) * 255 / 100);
    colorScore.b2 = Math.round((score.b / (currentQuestions.length)) * 255 / 100);
    const hex = `#${toHex(colorScore.r2)}${toHex(colorScore.g2)}${toHex(colorScore.b2)}`;
    const intensity = Math.round((totalScore / maxScore) * 100);

    const colorMap = [
        { label: 'Red – Free-Thinking', key: 'r1', value: colorScore.r2 },
        { label: 'Green – Expressive', key: 'g1', value: colorScore.g2 },
        { label: 'Blue – Structured', key: 'b1', value: colorScore.b2 }
    ];
    colorMap.sort((a, b) => b.value - a.value);
    const dominant = colorMap[0];
    const secondary = colorMap[1];
    colorLabel.textContent = `Dominant Thinking Style: ${dominant.label}
    Secondary Style: ${secondary.label}`;

    container.style.display = 'none';
    resultBox.style.display = 'block';
    colorBox.style.backgroundColor = hex;
    hexDisplay.textContent = `Hexcode: ${hex}`;
    if (intensity < 100) {
        label = "Developing";
        comment = "Your thinking style is still forming or highly specialized. There's strength in subtlety.";
    } else if (intensity < 200) {
        label = "Focused";
        comment = "You're showing clear consistency in your thought pattern. A strong mind with clear direction.";
    } else {
        label = "Multidimensional Brilliance";
        comment = "Your mind expresses deep clarity across multiple dimensions of intelligence. This is a rare profile.";
    }
    intensityLabel.textContent = `Mind Intensity: ${intensity}% – ${label}`;
    intensityComment.textContent = comment;

    document.getElementById('restart-btn').addEventListener('click', () => {
        location.reload();
    });
}

function toHex(n) {
    return n.toString(16).padStart(2, '0').toUpperCase();
}
