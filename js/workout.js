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
${curEx.machineConfig ? `<div style="font-size:12px;color:var(--t3);margin-bottom:4px">⚙️ ${curEx.machineConfig}</div>` : ''}
<button class="btn xs ghost" style="margin-bottom:6px" onclick="openEditExercise(${exIdx})">
  <i class="ti ti-edit"></i> Editar ejercicio
</button>
      <div class="set-progress" style="margin-top:6px">Serie ${setIdx+1} de ${totalSets}</div>
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

function openEditExercise(idx) {
  const ex = workout.log[idx];
  // Build inline edit panel replacing the card temporarily
  const panel = document.getElementById('wk-edit-panel');
  if (panel) { panel.remove(); return; } // toggle off

  const div = document.createElement('div');
  div.id = 'wk-edit-panel';
  div.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:420px;background:var(--bg);border-top:0.5px solid var(--bd);border-radius:16px 16px 0 0;padding:16px;z-index:80;box-shadow:0 -4px 20px rgba(0,0,0,.12)';
  div.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span style="font-size:14px;font-weight:500">Editar ejercicio</span>
      <button class="btn xs ghost" onclick="document.getElementById('wk-edit-panel').remove()"><i class="ti ti-x"></i></button>
    </div>
    <label class="lbl">Nombre</label>
    <input type="text" id="wk-edit-name" value="${esc(ex.name)}" style="margin-bottom:8px">
    <label class="lbl">⚙️ Config. máquina (opcional)</label>
    <input type="text" id="wk-edit-config" value="${esc(ex.machineConfig||'')}" placeholder="Asiento, apoyo, altura...">
    <button class="btn ac full" style="margin-top:12px" onclick="saveEditExercise(${idx})">
      <i class="ti ti-device-floppy"></i> Guardar
    </button>`;
  document.body.appendChild(div);
}

function saveEditExercise(idx) {
  const name   = document.getElementById('wk-edit-name')?.value.trim();
  const config = document.getElementById('wk-edit-config')?.value.trim();
  if (!name) return;

  // Update log
  workout.log[idx].name = name;
  workout.log[idx].machineConfig = config;

  // Update original routine
  const routine = S.routines.find(r => r.id === workout.routineId);
  if (routine && routine.exercises[idx]) {
    routine.exercises[idx].name = name;
    routine.exercises[idx].machineConfig = config;
    save();
  }

  document.getElementById('wk-edit-panel')?.remove();
  renderWorkout();
  showToast('✓ Ejercicio actualizado');
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
let restStartedAt = null;
let restNotifId = null;
const REST_CIRC = 515;

function playRestEndSound(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22, 0.44].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + offset + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + offset + 0.18);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch(e){}
}

async function requestNotifPermission(){
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') await Notification.requestPermission();
}

function scheduleRestNotif(secs, nextLabel){
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (restNotifId) { clearTimeout(restNotifId); restNotifId = null; }
  restNotifId = setTimeout(() => {
    new Notification('¡Descanso terminado!', {
      body: nextLabel || 'Es hora de la siguiente serie',
      icon: './icon-192.png', silent: false
    });
  }, secs * 1000);
}

function cancelRestNotif(){
  if (restNotifId) { clearTimeout(restNotifId); restNotifId = null; }
}

function handleVisibilityChange(){
  if (document.visibilityState === 'visible' && restStartedAt !== null) {
    const elapsed = Math.floor((Date.now() - restStartedAt) / 1000);
    restLeft = Math.max(0, restTotal - elapsed);
    updateRestDisplay();
    if (restLeft <= 0) { clearInterval(restTimer); restStartedAt = null; onRestEnd(); }
  }
}
document.addEventListener('visibilitychange', handleVisibilityChange);

function onRestEnd(){
  playRestEndSound();
  if(navigator.vibrate) navigator.vibrate([100,50,100,50,100]);
  cancelRestNotif();
  setTimeout(()=>{ document.getElementById('rest-overlay').classList.remove('on'); }, 400);
}

function startRest(nextLabel){
  clearInterval(restTimer);
  restLeft = restTotal;
  restStartedAt = Date.now();
  updateRestDisplay();
  document.getElementById('rest-next-label').textContent = nextLabel || '';
  document.getElementById('rest-overlay').classList.add('on');
  if(navigator.vibrate) navigator.vibrate(200);
  scheduleRestNotif(restTotal, nextLabel);
  restTimer = setInterval(()=>{
    restLeft--;
    updateRestDisplay();
    if(restLeft <= 0){ clearInterval(restTimer); restStartedAt = null; onRestEnd(); }
  }, 1000);
}

function updateRestDisplay(){
  document.getElementById('rest-num').textContent = restLeft;
  const pct = restLeft / restTotal;
  document.getElementById('rest-arc').style.strokeDashoffset = REST_CIRC * (1 - pct);
  document.querySelectorAll('.rest-preset').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.secs || b.textContent) === restTotal);
  });
  const ci = document.getElementById('rest-custom-input');
  if (ci && document.activeElement !== ci) ci.value = restTotal;
}

function setRestTime(secs){
  secs = Math.max(15, Math.min(secs, 600));
  restTotal = secs; restLeft = secs;
  restStartedAt = Date.now();
  clearInterval(restTimer); cancelRestNotif();
  updateRestDisplay();
  const label = document.getElementById('rest-next-label')?.textContent || '';
  scheduleRestNotif(secs, label);
  restTimer = setInterval(()=>{
    restLeft--;
    updateRestDisplay();
    if(restLeft <= 0){ clearInterval(restTimer); restStartedAt = null; onRestEnd(); }
  }, 1000);
}

function setRestTimeFromInput(){
  const ci = document.getElementById('rest-custom-input');
  if (!ci) return;
  const raw = ci.value.trim();
  if (raw === '') return;
  let val = parseInt(raw);
  if (isNaN(val) || val < 15) { ci.value = restTotal; return; }
  if (val <= 15) val = val * 60;
  val = Math.min(val, 600);
  ci.value = val;
  setRestTime(val);
}

function addRestTime(secs){
  restLeft = Math.min(restLeft + secs, 600);
  restTotal = Math.max(restTotal, restLeft);
  restStartedAt = Date.now() - ((restTotal - restLeft) * 1000);
  cancelRestNotif();
  const label = document.getElementById('rest-next-label')?.textContent || '';
  scheduleRestNotif(restLeft, label);
  updateRestDisplay();
}

function skipRest(){
  clearInterval(restTimer); cancelRestNotif();
  restStartedAt = null;
  document.getElementById('rest-overlay').classList.remove('on');
}