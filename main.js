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
"https://flagcdn.com/w320/"+current.code+".png";

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
  show("○ 正解！","green");

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
show("正解: " + current.jp + " / " + current.en, "red");
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

function togglePause(){

  paused = !paused;

  if(paused){
    // 停止
    clearInterval(timer);
    clearInterval(timeAttackTimer);
  }else{
    // 再開
    if(isTimeAttack){
      startTimeAttackTimer();
    }else{
      startTimer();
    }
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
  document.getElementById("homeScreen").style.display = "block";
  document.getElementById("gameScreen").style.display = "none";
}

function startNormal() {
  gameMode = "normal";
  document.getElementById("modeTitle").innerText = "通常モード/Normal mode";
  showGameScreen();
  nextQuestion();
}

function startContinent() {
  gameMode = "continent";
  document.getElementById("modeTitle").innerText = "大陸別モード/Continent mode";
  showGameScreen();
  nextQuestion();
}

function startReview() {
  gameMode = "review";
  document.getElementById("modeTitle").innerText = "復習モード/Review mode";
  showGameScreen();
  nextQuestion();
}

function startTimeAttack() {
  clearInterval(timer); // 10秒タイマーを完全停止
  
  gameMode = "timeAttack";
  isTimeAttack = true;
  totalTime = 60;
  score = 0;
  combo = 0;
  
  document.getElementById("modeTitle").innerText = "🔥 1分チャレンジ/1-minute challenge";
  showGameScreen();
  startTimeAttackTimer();
  nextQuestion();
}

//function startTimeAttackTimer(){

 // clearInterval(timeAttackTimer); // ← これ追加

 // document.getElementById("time").textContent = totalTime;

 // timeAttackTimer = setInterval(() => {

   // if(!paused){
      //totalTime--;
      //document.getElementById("time").textContent = totalTime;

      //if(totalTime <= 0){
      //  clearInterval(timeAttackTimer);
     //   endTimeAttack();
     // }
    //}

  //}, 1000);
//}

function startTimeAttackTimer(){

  clearInterval(timeAttackTimer);

  document.getElementById("time").textContent = totalTime;

  timeAttackTimer = setInterval(() => {

    totalTime--;

    if(totalTime <= 0){
      totalTime = 0;
      document.getElementById("time").textContent = 0;

      clearInterval(timeAttackTimer);
      endTimeAttack();
      return;
    }

    document.getElementById("time").textContent = totalTime;

  }, 1000);
}


function endTimeAttack(){
  clearInterval(timer); // 1問タイマー止める
  isTimeAttack = false;
  clearInterval(timeAttackTimer);
  alert("終了！スコア: " + score);

  goHome();
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
  isTimeAttack = false;

  let best = localStorage.getItem("taHighScore") || 0;

  if(score > best){
    localStorage.setItem("taHighScore", score);
    document.getElementById("timeAttackResult")
      .classList.add("newRecord");

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
  let amount = level === 1 ? 60 : 200;
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
    if(Date.now() - start < 1500){
      animationId = requestAnimationFrame(draw);
    }else{
      cancelAnimationFrame(animationId);
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }

  draw();
}

updateHighScore();
nextQuestion();
updateTimeAttackDisplay();
