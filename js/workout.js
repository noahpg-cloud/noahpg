// ---- WORKOUT ----
function startWorkout(rid){
  const r = S.routines.find(x=>x.id===rid); if(!r) return;
  workout = {
    routineId: rid, routineName: r.name,
    exIdx: 0, setIdx: 0,
    log: r.exercises.map(e=>({name:e.name, machineConfig:e.machineConfig||'', sets: e.sets.map(s=>({kg:s.kg||'',reps:s.reps||'', done:false, hit:null}))})),
    startTime: Date.now()
  };
  wkSeconds = 0;
  clearInterval(wkTimer);
  wkTimer = setInterval(()=>{ wkSeconds++; updateWkTimer(); }, 1000);
  document.getElementById('wk-title').textContent = r.name;
  goTo('s-workout', null);
  renderWorkout();
}

function updateWkTimer(){
  const m = Math.floor(wkSeconds/60), s = wkSeconds%60;
  document.getElementById('wk-timer').textContent = m+':'+(s<10?'0':'')+s;
}

function renderWorkout(){
  const cnt = document.getElementById('wk-content');
  if(!workout){ cnt.innerHTML=''; return; }
  const {exIdx, setIdx, log} = workout;
  if(exIdx >= log.length){ showWorkoutComplete(); return; }
  const curEx = log[exIdx];
  const curSet = curEx.sets[setIdx];
  const totalSets = curEx.sets.length;
  const totalEx = log.length;

  let upcomingHtml = '';
  const upcoming = log.slice(exIdx+1, exIdx+4);
  if(upcoming.length){
    upcomingHtml = `<div class="upcoming"><div class="upcoming-title">A continuación</div>
      ${upcoming.map(e=>`<div class="upcoming-item"><i class="ti ti-chevron-right"></i>${e.name} — ${e.sets.length} series</div>`).join('')}
    </div>`;
  }

  const seriesLog = curEx.sets.map((s,i)=>{
    const done = i<setIdx || (i===setIdx && s.done);
    return `<div class="series-row">
      <div class="series-num ${i<setIdx?(s.hit===false?'miss':'done'):''}">${i<setIdx?(s.hit===false?'✗':'✓'):(i+1)}</div>
      <span style="flex:1;font-size:13px;color:${i<setIdx?'var(--t2)':'#1a1a1a'}">${s.kg||'?'}kg × ${s.reps||'?'} reps</span>
      ${i===setIdx?'<span style="font-size:11px;color:var(--ac)">← ahora</span>':''}
    </div>`;
  }).join('');

  cnt.innerHTML = `
    <div style="font-size:12px;color:var(--t2);margin-bottom:10px">Ejercicio ${exIdx+1} de ${totalEx}</div>
    <div class="ex-card-big">
      <div class="ex-name-big">${curEx.name}</div>
      ${curEx.machineConfig ? `<div style="font-size:12px;color:var(--t3);margin-bottom:6px">⚙️ ${curEx.machineConfig}</div>` : ''}
      <div class="set-progress">Serie ${setIdx+1} de ${totalSets}</div>
      <div class="set-inputs">
        <div class="set-inp-wrap">
          <div class="set-inp-label">Peso (kg)</div>
          <input class="big-input" type="number" id="wk-kg" value="${curSet.kg}" min="0" step="0.5" onchange="workout.log[${exIdx}].sets[${setIdx}].kg=this.value">
        </div>
        <div class="set-sep">×</div>
        <div class="set-inp-wrap">
          <div class="set-inp-label">Repeticiones</div>
          <input class="big-input" type="number" id="wk-reps" value="${curSet.reps}" min="1" onchange="workout.log[${exIdx}].sets[${setIdx}].reps=this.value">
        </div>
      </div>
      <button class="done-btn" onclick="openConfirmSet()"><i class="ti ti-check" style="font-size:20px"></i> ¡Hecho!</button>
      <button class="btn full" style="margin-top:8px;color:var(--warn);border-color:var(--warn)" onclick="openConfirmSet(false)"><i class="ti ti-x"></i> No completado</button>
      <div class="series-list">${seriesLog}</div>
    </div>
    ${upcomingHtml}
    <button class="btn full" style="margin-top:6px;color:var(--t2)" onclick="skipExercise()"><i class="ti ti-player-skip-forward"></i> Saltar ejercicio</button>
  `;
}

function completeSet(hit){
  const kg = document.getElementById('wk-kg').value;
  const reps = document.getElementById('wk-reps').value;
  workout.log[workout.exIdx].sets[workout.setIdx].kg = kg;
  workout.log[workout.exIdx].sets[workout.setIdx].reps = reps;
  workout.log[workout.exIdx].sets[workout.setIdx].done = true;
  workout.log[workout.exIdx].sets[workout.setIdx].hit = hit;
  
  const curEx = workout.log[workout.exIdx];
  let isLast = false;
  if(workout.setIdx < curEx.sets.length - 1){
    workout.setIdx++;
  } else {
    workout.exIdx++;
    workout.setIdx = 0;
    isLast = true;
  }
  
  if(workout.exIdx < workout.log.length){
    const nextEx = workout.log[workout.exIdx];
    const nextLabel = isLast ? `Siguiente: ${nextEx.name}` : `Serie ${workout.setIdx + 1} de ${nextEx.sets.length}`;
    startRest(nextLabel);
  }
  renderWorkout();
}

function skipExercise(){
  if(!workout) return;
  // Mark remaining sets of current exercise as skipped
  const curEx = workout.log[workout.exIdx];
  for(let i = workout.setIdx; i < curEx.sets.length; i++){
    curEx.sets[i].done = false;
    curEx.sets[i].hit = null;
  }
  workout.exIdx++;
  workout.setIdx = 0;
  // Close rest overlay if open
  skipRest();
  renderWorkout();
}

function showWorkoutComplete(){
  clearInterval(wkTimer);
  const m = Math.floor(wkSeconds/60), s = wkSeconds%60;
  const dur = m+'min '+(s<10?'0':'')+s+'s';
  const total = workout.log.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const date = new Date().toISOString().split('T')[0];
  S.sessions.push({id:Date.now(), routineName:workout.routineName, date, duration:dur, log:workout.log});
  save(); renderHome(); renderProgressSelect();
  document.getElementById('wk-content').innerHTML = `
    <div class="complete-screen">
      <i class="ti ti-trophy"></i>
      <h2>¡Entrenamiento completado!</h2>
      <p>${workout.routineName}<br>${total} series · ${dur}</p>
      <button class="btn ac full" style="margin-top:24px" onclick="goTo('s-home','mi-home')"><i class="ti ti-home"></i> Volver al inicio</button>
    </div>`;
  workout = null;
}

function confirmExitWorkout(){ skipRest(); openModal('modal-exit'); }

function pauseWorkout(){
  clearInterval(wkTimer);
  S.pausedWorkout = { ...workout, elapsedSeconds: wkSeconds };
  save(); renderHome(); closeModal('modal-exit');
  workout=null; goTo('s-home','mi-home');
}

function resumeWorkout(){
  if(!S.pausedWorkout) return;
  workout = S.pausedWorkout;
  wkSeconds = workout.elapsedSeconds || 0;
  clearInterval(wkTimer);
  wkTimer = setInterval(()=>{ wkSeconds++; updateWkTimer(); }, 1000);
  document.getElementById('wk-title').textContent = workout.routineName;
  S.pausedWorkout = null;
  save(); renderHome();
  goTo('s-workout', null);
  renderWorkout();
}

function exitWorkout(){
  clearInterval(wkTimer);
  if(workout){
    const m=Math.floor(wkSeconds/60),s=wkSeconds%60;
    const dur=m+'min '+(s<10?'0':'')+s+'s';
    const date=new Date().toISOString().split('T')[0];
    const doneSets = workout.log.filter(e=>e.sets.some(s=>s.done));
    if(doneSets.length) S.sessions.push({id:Date.now(),routineName:workout.routineName,date,duration:dur,log:workout.log});
    save(); renderHome(); renderProgressSelect();
  }
  workout=null; closeModal('modal-exit'); goTo('s-home','mi-home');
}

function discardWorkout(){
  clearInterval(wkTimer);
  workout=null; S.pausedWorkout=null;
  save(); renderHome(); closeModal('modal-exit'); goTo('s-home','mi-home');
}

// ---- CONFIRM SET OVERLAY ----
let pendingHit = true;
function openConfirmSet(hit = true){
  pendingHit = hit;
  const kg = document.getElementById('wk-kg').value;
  const reps = document.getElementById('wk-reps').value;
  const sub = kg && reps ? `${kg} kg × ${reps} reps` : '';
  document.getElementById('confirm-title').textContent = hit ? '¿Serie completada?' : '¿Marcar como no completada?';
  document.getElementById('confirm-sub').textContent = sub;
  document.getElementById('confirm-ok-btn').style.display = hit ? '' : 'none';
  document.getElementById('confirm-miss-btn').style.display = hit ? '' : 'none';
  if(!hit){
    document.getElementById('confirm-ok-btn').style.display = 'none';
    document.getElementById('confirm-miss-btn').style.display = '';
  } else {
    document.getElementById('confirm-ok-btn').style.display = '';
    document.getElementById('confirm-miss-btn').style.display = '';
  }
  document.getElementById('confirm-sheet').classList.add('on');
  document.getElementById('confirm-overlay').classList.add('on');
}
function cancelConfirm(){
  document.getElementById('confirm-sheet').classList.remove('on');
  document.getElementById('confirm-overlay').classList.remove('on');
}
function confirmSetDone(){ cancelConfirm(); completeSet(true); }
function confirmSetMiss(){ cancelConfirm(); completeSet(false); }

// ---- REST TIMER ----
let restTimer = null;
let restTotal = 90;
let restLeft = 90;
const REST_CIRC = 515;

function startRest(nextLabel){
  clearInterval(restTimer);
  restLeft = restTotal;
  updateRestDisplay();
  document.getElementById('rest-next-label').textContent = nextLabel || '';
  document.getElementById('rest-overlay').classList.add('on');
  if(navigator.vibrate) navigator.vibrate(200);
  restTimer = setInterval(()=>{
    restLeft--;
    updateRestDisplay();
    if(restLeft <= 0){
      clearInterval(restTimer);
      if(navigator.vibrate) navigator.vibrate([100,50,100]);
      setTimeout(()=>{ document.getElementById('rest-overlay').classList.remove('on'); }, 400);
    }
  }, 1000);
}

function updateRestDisplay(){
  document.getElementById('rest-num').textContent = restLeft;
  const pct = restLeft / restTotal;
  const offset = REST_CIRC * (1 - pct);
  document.getElementById('rest-arc').style.strokeDashoffset = offset;
  document.querySelectorAll('.rest-preset').forEach(b=>{
    b.classList.toggle('active', parseInt(b.textContent) === restTotal || (b.textContent==='2min'&&restTotal===120) || (b.textContent==='3min'&&restTotal===180));
  });
}

function setRestTime(secs){
  restTotal = secs;
  restLeft = secs;
  clearInterval(restTimer);
  updateRestDisplay();
  restTimer = setInterval(()=>{
    restLeft--;
    updateRestDisplay();
    if(restLeft <= 0){
      clearInterval(restTimer);
      if(navigator.vibrate) navigator.vibrate([100,50,100]);
      setTimeout(()=>{ document.getElementById('rest-overlay').classList.remove('on'); }, 400);
    }
  }, 1000);
}

function addRestTime(secs){
  restLeft = Math.min(restLeft + secs, 600);
  restTotal = Math.max(restTotal, restLeft);
  updateRestDisplay();
}

function skipRest(){
  clearInterval(restTimer);
  document.getElementById('rest-overlay').classList.remove('on');
}