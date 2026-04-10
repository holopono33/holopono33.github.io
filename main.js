let audioCtx;

document.addEventListener("click", () => {
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
});
let gameMode = "normal";
let wrongAnswers = [];
let current;
let score=0;
let combo=0;
let timeLeft=10;
let timer;
let wrongList=[];
let reviewMode=false;
let paused=false;
let totalAnswers=0;
let selectedContinent="all";

let isTimeAttack = false;
let totalTime = 60;
let timeAttackTimer;

function normalize(t){ return t.trim().toLowerCase(); }

function toHiragana(str){
  return str.replace(/[\u30a1-\u30f6]/g, function(match){
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

function updateUI(){
document.getElementById("score").textContent=score;
document.getElementById("combo").textContent=combo;
document.getElementById("reviewCount").textContent=wrongList.length;
document.getElementById("accuracy").textContent=
totalAnswers?Math.floor(score/totalAnswers*100):0;
updateHighScore();
}

function updateHighScore(){
let hs=localStorage.getItem("highScore")||0;
if(score>hs){localStorage.setItem("highScore",score);}
document.getElementById("highScore").textContent=
localStorage.getItem("highScore")||0;
}

function startTimer(){

  clearInterval(timer); // ← これ追加

  document.getElementById("time").textContent = timeLeft;

  timer = setInterval(()=>{

    if(!paused){
      timeLeft--;
      document.getElementById("time").textContent = timeLeft;

      if(timeLeft <= 0){
        clearInterval(timer);
        skipQuestion(true);
      }
    }

  },1000);
}

function nextQuestion(){ 
clearInterval(timer);
paused=false;
if(!isTimeAttack){
  timeLeft = 10;
}

let source = countries;

// 🔁 復習モード
if (gameMode === "review" && wrongList.length > 0) {
  source = wrongList;
}

// 🌎 大陸別モード
if (gameMode === "continent") {
  source = countries.filter(c =>
    selectedContinent === "all" || c.continent === selectedContinent
  );
}

// 🏆 1分チャレンジ
if (gameMode === "timeAttack") {
  source = countries;
}

current = source[Math.floor(Math.random()*source.length)];

document.getElementById("flag").src = 
"flags/" + current.code + ".png";

document.getElementById("answer").value="";
document.getElementById("result").textContent="";
if(!isTimeAttack){
startTimer();
}
}

function checkAnswer(){
if(!isTimeAttack){
clearInterval(timer);
}
totalAnswers++;

let input = normalize(document.getElementById("answer").value);

let jp = normalize(current.jp);
let en = normalize(current.en);
let correct = false;

if(
  input === jp ||
  input === en ||
  input === toHiragana(jp)
){
correct = true;
}

if(current.aliases){
  current.aliases.forEach(a=>{
    if(input === normalize(a)){
      correct = true;
    }
  });
}

if(correct){

  score++;
  combo++;

  if(combo % 5 === 0){　　//紙吹雪　30コンボ以上は特大

  if(combo >= 30){
    launchConfetti(3);
  }
  else if(combo % 10 === 0){
    launchConfetti(2);
  }
  else{
    launchConfetti(1);
  }

}

  wrongList = wrongList.filter(c => c.code !== current.code);

  playCorrect();
  show("○ 正解！/Correct!","green");

}else{
  combo = 0;
  addWrong();

  playWrong();
  show("× 正解: " + current.jp + " / " + current.en, "red");
}

updateUI();
setTimeout(nextQuestion,1500);
}


function skipQuestion(timeup=false){
if(!isTimeAttack){
clearInterval(timer);
}
combo=0;
addWrong();
show("× 正解: " + current.jp + " / " + current.en, "red");
updateUI();
setTimeout(nextQuestion,1500);
}

function addWrong(){
if(!wrongList.some(c=>c.code===current.code)){
wrongList.push(current);
}
}

function show(t,color){
let r=document.getElementById("result");
r.textContent=t;
r.style.color=color;
}

function resetTimeAttackState() {
  clearInterval(timeAttackTimer);
  timeAttackTimer = null;

  isTimeAttack = false;
  totalTime = 60;
  paused = false;

  const timeEl = document.getElementById("time");
  if (timeEl) {
    timeEl.textContent = 10; // 通常モードの表示に戻す
  }

  const btn = document.getElementById("pauseBtn");
  if (btn) {
    btn.textContent = "⏸ 停止 / Pause";
    btn.classList.remove("resumeMode");
  }
}

function togglePause() {
  paused = !paused;

  const btn = document.getElementById("pauseBtn");
  if (!btn) return;

  if (paused) {
    clearInterval(timer);
    clearInterval(timeAttackTimer);
    timeAttackTimer = null;

    btn.textContent = "▶ 再開 / Resume";
    btn.classList.add("resumeMode");
  } else {
    if (isTimeAttack) {
      startTimeAttackTimer();
    } else {
      startTimer();
    }

    btn.textContent = "⏸ 停止 / Pause";
    btn.classList.remove("resumeMode");
  }
}

function toggleReviewMode(){
reviewMode=!reviewMode;
nextQuestion();
}

function changeContinent(){
selectedContinent=
document.getElementById("continentSelect").value;
nextQuestion();
}

function showGameScreen() {
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
}

function goHome() {
  clearInterval(timer);
  resetTimeAttackState();
  document.getElementById("homeScreen").style.display = "block";
  document.getElementById("gameScreen").style.display = "none";
}

function startNormal() {
  clearInterval(timer);
  resetTimeAttackState();

  gameMode = "normal";
  timeLeft = 10;
  score = 0;
  combo = 0;
  paused = false;

  document.getElementById("modeTitle").innerText = "通常モード/Normal mode";
  showGameScreen();
  nextQuestion();
}

function startContinent() {
  clearInterval(timer);
  resetTimeAttackState();

  gameMode = "continent";
  timeLeft = 10;
  score = 0;
  combo = 0;
  paused = false;

  document.getElementById("modeTitle").innerText = "大陸別モード/Continent mode";
  showGameScreen();
  nextQuestion();
}

function startReview() {
   clearInterval(timer);
  resetTimeAttackState();

  gameMode = "review";
  timeLeft = 10;
  score = 0;
  combo = 0;
  paused = false;

  document.getElementById("modeTitle").innerText = "復習モード/Review mode";
  showGameScreen();
  nextQuestion();
}

function openContinentModal() {
  const modal = document.getElementById("continentModal");
  const select = document.getElementById("continentSelect");

  // ⭐ 毎回リセット
  select.value = "";

  modal.classList.remove("hidden");
}

function closeContinentModal(event) {
  const modal = document.getElementById("continentModal");

  // 背景クリックでも閉じる
  if (!event || event.target === modal) {
    modal.classList.add("hidden");
  }
}

function startContinentFromSelect() {
  const select = document.getElementById("continentSelect");

  if (!select.value) return;

  changeContinent();   // ←あなたの既存関数
  closeContinentModal();
  startContinent();    // ←あなたの既存関数
}

function startTimeAttack() {
  clearInterval(timer);
  clearInterval(timeAttackTimer);
  timeAttackTimer = null;

  gameMode = "timeAttack";
  isTimeAttack = true;
  totalTime = 60;
  score = 0;
  combo = 0;
  paused = false;

  document.getElementById("modeTitle").innerText = "🔥 1分チャレンジ/1-Min challenge";
  showGameScreen();

  document.getElementById("score").textContent = 0;
  document.getElementById("currentScore").textContent = 0;
  document.getElementById("timeAttackResult").classList.remove("newRecord");
  document.getElementById("time").textContent = totalTime;

  const btn = document.getElementById("pauseBtn");
  if (btn) {
    btn.textContent = "⏸ 停止 / Pause";
    btn.classList.remove("resumeMode");
  }

  startTimeAttackTimer();
  nextQuestion();
}


function startTimeAttackTimer(){

  clearInterval(timeAttackTimer);
  timeAttackTimer = null;

  document.getElementById("time").textContent = totalTime;

  timeAttackTimer = setInterval(() => {
    if (paused) return;

    totalTime--;

    if (totalTime <= 0) {
      totalTime = 0;
      document.getElementById("time").textContent = 0;

      clearInterval(timeAttackTimer);
      timeAttackTimer = null;
      endTimeAttack();
      return;
    }

    document.getElementById("time").textContent = totalTime;
  }, 1000);
}

function getRank(score){
  if(score>=25) return "S";
  if(score>=15) return "A";
  if(score>=8) return "B";
  return "C";
}

function endTimeAttack(){
  clearInterval(timer);
  clearInterval(timeAttackTimer);
  timeAttackTimer = null;

  isTimeAttack = false;
  paused = false;
 // ★ これ追加（今回スコア表示）
  document.getElementById("currentScore").textContent = score;

  let best = Number(localStorage.getItem("taHighScore") || 0);

  if (score > best) {
    localStorage.setItem("taHighScore", score);
    document.getElementById("timeAttackResult").classList.add("newRecord");
 // ★ 初めてハイスコアを更新したときだけレビュー依頼を出す
    if (!localStorage.getItem("review_shown")) {
      navigator.store?.requestStoreReview();
      localStorage.setItem("review_shown", "1");
    }
  }

  updateTimeAttackDisplay();
  goHome();
}

function updateTimeAttackDisplay(){
  let best = localStorage.getItem("taHighScore") || 0;
  document.getElementById("taHighScore").textContent = best;

  let rank = getRank(best);
  let rankEl = document.getElementById("taRank");
  rankEl.textContent = rank;
  rankEl.className = "rank"+rank;

  // 仮ランキング（将来オンライン化可能）
  let ranking = "圏外";
  if(best>=40) ranking="全国1位級🔥";
  else if(best>=30) ranking="上位5%";
  else if(best>=20) ranking="上位20%";
  else ranking="挑戦者";

  document.getElementById("taRanking").textContent = ranking;
}

function playCorrect(){    // 正解音
  if(!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 900;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001, audioCtx.currentTime + 0.2
  );

  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

function playWrong(){　　// 不正解音
  if(!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 200;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001, audioCtx.currentTime + 0.4
  );

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}
function launchConfetti(level = 1){　　//紙吹雪

  const canvas = document.getElementById("confettiCanvas");
  if(!canvas) return;  // ← 保険（これ重要）

  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let pieces = [];
  // 👇 ここが重要（増加＋上限）
  let amount = Math.min(100 + (level * 50), 300);
  let animationId;
  let start = Date.now();

  for(let i=0;i<amount;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height - canvas.height,
      size: Math.random()*8+4,
      speed: Math.random()*3+2,
      color: `hsl(${Math.random()*360},100%,50%)`,
      tilt: Math.random()*10-5
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    pieces.forEach(p=>{
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y += p.speed;
      p.x += p.tilt;
    });

    // ★ 1.5秒で強制停止
    if(Date.now() - start < 1800){
      animationId = requestAnimationFrame(draw);
    }else{
      cancelAnimationFrame(animationId);
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }

  draw();
}


if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

(function () {
  function hideLoading() {
    var loading = document.getElementById("loadingScreen");
    if (loading) {
      loading.style.display = "none";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideLoading);
  } else {
    hideLoading();
  }

  window.addEventListener("pageshow", hideLoading);

  setTimeout(hideLoading, 1500);
})();

/* =========================
   図鑑モード
========================= */

let encyclopediaContinent = "";
let encyclopediaPage = 1;
const encyclopediaPageSize = 10;
let encyclopediaFilteredCountries = [];

// すべての画面を隠す
function hideAllScreens() {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen => {
    screen.style.display = "none";
  });
}

// ホームへ戻る
function backToHome() {
  hideAllScreens();
  document.getElementById("homeScreen").style.display = "block";
}

// 大陸選択画面を表示
function showContinentScreen() {
  hideAllScreens();
  document.getElementById("continentScreen").style.display = "block";
}

// 国旗一覧表示
function showFlagList(continent) {
  encyclopediaContinent = continent;
  encyclopediaPage = 1;

  const continentNames = {
    asia: { jp: "アジア", en: "Asia" },
    europe: { jp: "ヨーロッパ", en: "Europe" },
    africa: { jp: "アフリカ", en: "Africa" },
    northamerica: { jp: "北アメリカ", en: "North America" },
    southamerica: { jp: "南アメリカ", en: "South America" },
    oceania: { jp: "オセアニア", en: "Oceania" }
  };

  encyclopediaFilteredCountries = countries.filter(country => country.continent === continent);

  hideAllScreens();
  document.getElementById("flagListScreen").style.display = "block";
  document.getElementById("flagListTitle").innerHTML =
    `🏳️ ${continentNames[continent].jp} / <span>${continentNames[continent].en}</span>`;

  renderFlagPage();
}

// 一覧の1ページ分を描画
function renderFlagPage() {
  const flagList = document.getElementById("flagList");
  const pageIndicator = document.getElementById("pageIndicator");

  flagList.innerHTML = "";

  const totalPages = Math.ceil(encyclopediaFilteredCountries.length / encyclopediaPageSize);
  const startIndex = (encyclopediaPage - 1) * encyclopediaPageSize;
  const endIndex = startIndex + encyclopediaPageSize;

  const pageItems = encyclopediaFilteredCountries.slice(startIndex, endIndex);

  // 実際の国旗カード
  pageItems.forEach(country => {
    const card = document.createElement("div");
    card.className = "flagOnlyCard";

    card.innerHTML = `
      <img src="flags/${country.code}.png" alt="${country.jp}">
    `;

    card.addEventListener("click", function() {
      showCountryDetail(country);
    });

    flagList.appendChild(card);
  });

  // 足りない分を空カードで埋める
  const emptyCount = encyclopediaPageSize - pageItems.length;

  for (let i = 0; i < emptyCount; i++) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "flagOnlyCard emptyFlagCard";
    emptyCard.innerHTML = `<div class="emptyFlagInner"></div>`;
    flagList.appendChild(emptyCard);
  }

  pageIndicator.textContent = encyclopediaPage + " / " + totalPages;

  const prevBtn = document.querySelector(".pageControls .prevBtn");
  const nextBtn = document.querySelector(".pageControls .nextBtn");

  if (prevBtn) prevBtn.disabled = encyclopediaPage === 1;
  if (nextBtn) nextBtn.disabled = encyclopediaPage === totalPages;
}

// 前のページ
function prevFlagPage() {
  if (encyclopediaPage > 1) {
    encyclopediaPage--;
    renderFlagPage();
  }
}

// 次のページ
function nextFlagPage() {
  const totalPages = Math.ceil(encyclopediaFilteredCountries.length / encyclopediaPageSize);
  if (encyclopediaPage < totalPages) {
    encyclopediaPage++;
    renderFlagPage();
  }
}

// =========================
// 国詳細表示
// =========================
function showCountryDetail(country) {
  hideAllScreens();
  document.getElementById("countryDetailScreen").style.display = "block";

  const continentLabels = {
    asia: "大陸 / Continent: アジア / Asia",
    europe: "大陸 / Continent: ヨーロッパ / Europe",
    africa: "大陸 / Continent: アフリカ / Africa",
    northamerica: "大陸 / Continent: 北アメリカ / North America",
    southamerica: "大陸 / Continent: 南アメリカ / South America",
    oceania: "大陸 / Continent: オセアニア / Oceania"
  };

  document.getElementById("detailFlag").src = "flags/" + country.code + ".png";
  document.getElementById("detailFlag").alt = country.jp;
  document.getElementById("detailNameJp").textContent = country.jp;
  document.getElementById("detailNameEn").textContent = "英語名 / EN: " + country.en;
  document.getElementById("detailContinent").textContent =
    continentLabels[country.continent] || "";

  let capitalVisible = false;

  const extraInfo = document.getElementById("detailExtraInfo");
  extraInfo.innerHTML = `
    ${country.capital ? `
      <div class="detailRow">
        <span class="detailLabel"><span class="icon">🏙️</span>首都 / Cap:</span>
        <span class="detailValue" id="capitalValue">👉タップで表示/Tap to show</span>
      </div>
    ` : ""}
    ${country.population ? `
      <div class="detailRow">
        <span class="detailLabel"><span class="icon">👥</span>人口 / Pop:</span>
        <span class="detailValue">${country.population}</span>
      </div>
    ` : ""}
    ${country.landarea ? `
      <div class="detailRow">
        <span class="detailLabel"><span class="icon">🌍</span>面積 / Area:</span>
        <span class="detailValue">${country.landarea}</span>
      </div>
    ` : ""}
    ${country.currency ? `
      <div class="detailRow">
        <span class="detailLabel"><span class="icon">💰</span>通貨 / Curr:</span>
        <span class="detailValue">${country.currency}</span>
      </div>
    ` : ""}
    ${country.language ? `
      <div class="detailRow">
        <span class="detailLabel"><span class="icon">🗣️</span>言語 / Lang:</span>
        <span class="detailValue">${country.language}</span>
      </div>
    ` : ""}
  `;

  // =========================
  // 国旗クリックで表示ON/OFF
  // =========================
  const flagWrap = document.querySelector("#countryDetailScreen .flagWrap");
  flagWrap.onclick = function () {
    const capitalEl = document.getElementById("capitalValue");
    if (!capitalEl) return;

    capitalVisible = !capitalVisible;
    capitalEl.textContent = capitalVisible
      ? country.capital
      : "👉 国旗をタップして首都を表示";
  };

  // =========================
  // iPhoneでもタップ縮小が見えるようにする
  // =========================
  flagWrap.ontouchstart = function () {
    flagWrap.classList.add("tapActive");
  };

  flagWrap.ontouchend = function () {
    flagWrap.classList.remove("tapActive");
  };

  flagWrap.ontouchcancel = function () {
    flagWrap.classList.remove("tapActive");
  };

  flagWrap.onmousedown = function () {
    flagWrap.classList.add("tapActive");
  };

  flagWrap.onmouseup = function () {
    flagWrap.classList.remove("tapActive");
  };

  flagWrap.onmouseleave = function () {
    flagWrap.classList.remove("tapActive");
  };

  document.getElementById("detailBackBtn").onclick = function () {
    hideAllScreens();
    document.getElementById("flagListScreen").style.display = "block";
    renderFlagPage();
  };
}

updateHighScore();
nextQuestion();
updateTimeAttackDisplay();

// =========================
// Android判定（最後に追加）
// =========================
window.addEventListener("DOMContentLoaded", () => {
  if (/Android/i.test(navigator.userAgent)) {
    document.body.classList.add("android-device");
  }
});