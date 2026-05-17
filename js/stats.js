// ---- HOME ----
let profileExpanded = false;

function toggleProfileCard() {
  profileExpanded = !profileExpanded;
  const body = document.getElementById('profile-body');
  const icon = document.getElementById('profile-chevron');
  if (!body) return;
  body.classList.toggle('open', profileExpanded);
  if (icon) icon.className = `ti ti-chevron-${profileExpanded ? 'up' : 'down'}`;
}

function renderProfileCard() {
  const wrap = document.getElementById('home-profile');
  if (!wrap) return;
  const p = S.profile;
  const hasData = p && p.weight && p.height && p.age;

  if (!hasData) {
    wrap.innerHTML = `
      <div class="card" style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--t1)">👤 Mi perfil</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">Añade tus datos para calcular IMC y calorías</div>
        </div>
        <button class="btn xs ac" onclick="openProfileModal()"><i class="ti ti-user-edit"></i> Completar</button>
      </div>`;
    return;
  }

  const calc = calcProfile(p);
  const bmiColor = !calc ? 'var(--t2)' : parseFloat(calc.bmi) < 18.5 ? '#3b82f6' : parseFloat(calc.bmi) < 25 ? 'var(--ok)' : parseFloat(calc.bmi) < 30 ? 'var(--warn)' : '#dc2626';
  const summaryLine = [
    p.weight ? p.weight + 'kg' : '',
    p.height ? p.height + 'cm' : '',
    p.age ? p.age + ' años' : '',
    p.sex === 'female' ? 'Mujer' : 'Hombre',
    GOALS[p.goal]?.label || ''
  ].filter(Boolean).join(' · ');

  wrap.innerHTML = `
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="toggleProfileCard()">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--t1)">${p.name ? '👤 ' + esc(p.name) : '👤 Mi perfil'}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">${summaryLine}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn xs ghost" onclick="event.stopPropagation();openProfileModal()"><i class="ti ti-edit"></i></button>
          <i id="profile-chevron" class="ti ti-chevron-${profileExpanded ? 'up' : 'down'}" style="color:var(--t3);font-size:16px"></i>
        </div>
      </div>

      <div id="profile-body" class="profile-body${profileExpanded ? ' open' : ''}">
        <div style="margin-top:12px">
        ${calc ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
            <div style="background:var(--bg);border-radius:10px;padding:10px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:${bmiColor}">${calc.bmi}</div>
              <div style="font-size:10px;color:var(--t3);margin-top:2px">IMC · ${calc.bmiLabel}</div>
            </div>
            <div style="background:var(--bg);border-radius:10px;padding:10px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:var(--ac)">${calc.targetKcal}</div>
              <div style="font-size:10px;color:var(--t3);margin-top:2px">kcal objetivo/día</div>
            </div>
          </div>
          <div style="background:var(--bg);border-radius:10px;padding:10px;margin-bottom:8px">
            <div style="font-size:10px;color:var(--t3);margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Macros sugeridos</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;text-align:center">
              <div><div style="font-size:16px;font-weight:700;color:#ef4444">${calc.macros.protein}g</div><div style="font-size:10px;color:var(--t3)">Proteína</div></div>
              <div><div style="font-size:16px;font-weight:700;color:#f59e0b">${calc.macros.carbs}g</div><div style="font-size:10px;color:var(--t3)">Carbos</div></div>
              <div><div style="font-size:16px;font-weight:700;color:#8b5cf6">${calc.macros.fat}g</div><div style="font-size:10px;color:var(--t3)">Grasa</div></div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--t3);text-align:center;margin-bottom:8px">TDEE: ${calc.tdee} kcal · BMR: ${calc.bmr} kcal</div>
        ` : ''}
        ${p.goalWeight || p.goalNote ? `
          <div style="padding:8px 10px;background:var(--ac2);border-radius:8px;border-left:3px solid var(--ac)">
            <div style="font-size:10px;color:var(--ac);font-weight:600;margin-bottom:2px">🎯 Meta</div>
            <div style="font-size:12px;color:var(--t1)">${p.goalWeight ? 'Peso objetivo: ' + p.goalWeight + 'kg' : ''}${p.goalWeight && p.goalNote ? ' · ' : ''}${p.goalNote ? esc(p.goalNote) : ''}</div>
          </div>` : ''}
        </div>
      </div>
    </div>`;
}

function calcTrainingHours() {
  // Parse "Xmin Ys" format from session duration strings
  const toMins = dur => {
    if (!dur) return 0;
    const m = parseInt(dur) || 0;
    return m;
  };
  const now = new Date();
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
  const weekAgo  = new Date(now); weekAgo.setDate(now.getDate() - 7);

  let totalMins = 0, monthMins = 0, weekMins = 0;
  S.sessions.forEach(s => {
    const mins = toMins(s.duration);
    totalMins += mins;
    const d = new Date(s.date);
    if (d >= monthAgo) monthMins += mins;
    if (d >= weekAgo)  weekMins  += mins;
  });
  const fmt = m => m < 60 ? m + 'min' : (m/60).toFixed(1).replace('.0','') + 'h';
  return { total: fmt(totalMins), month: fmt(monthMins), week: fmt(weekMins), totalMins };
}

function renderHome(){
  // Routine badge
  const badge = document.getElementById('st-rut-badge');
  if (badge) {
    const active = S.routines.filter(r => !r.archived).length;
    const total  = S.routines.length;
    badge.textContent = total > 0 ? (total === active ? `${total} rutinas` : `${active} activas · ${total-active} archivadas`) : '';
  }

  const prMap = {};
  S.sessions.forEach(s=>s.log.forEach(e=>e.sets.forEach(st=>{
    const k=parseFloat(st.kg)||0;
    if(!prMap[e.name]||k>prMap[e.name]) prMap[e.name]=k;
  })));
  // Sessions count + hours — injected into PR card header
  const sesCount = S.sessions.length;
  const prCard = document.getElementById('pr-card');
  if (prCard) {
    const hours = calcTrainingHours();
    prCard.querySelector('div').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:13px;color:var(--t2);font-weight:500">🏆 Mejores marcas</span>
        <span style="font-size:11px;color:var(--t3)">${sesCount} sesiones</span>
      </div>
      <div class="hours-grid" style="margin-bottom:10px">
        <div class="hours-cell"><div class="hours-val">${hours.total}</div><div class="hours-lbl">Total entrenado</div></div>
        <div class="hours-cell"><div class="hours-val">${hours.month}</div><div class="hours-lbl">Último mes</div></div>
      </div>`;
  }

  const prEntries = Object.entries(prMap).sort((a,b)=>b[1]-a[1]);
  const prDiv = document.getElementById('st-prs');
  if(!prEntries.length){ prDiv.innerHTML='<div style="font-size:12px;color:var(--t3)">Aún sin sesiones registradas.</div>'; }
  else prDiv.innerHTML = prEntries.slice(0,5).map(([name,kg])=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:0.5px solid var(--bd)">
      <span style="font-size:13px;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${name}</span>
      <span style="font-size:13px;font-weight:600;color:var(--ac)">${kg} kg</span>
    </div>`).join('') + (prEntries.length>5?`<div style="font-size:11px;color:var(--t3);margin-top:6px;text-align:center">+${prEntries.length-5} ejercicios más en Progreso</div>`:'');

  const existingBanner = document.getElementById('paused-banner');
  if(existingBanner) existingBanner.remove();
  if(S.pausedWorkout){
    const banner = document.createElement('div');
    banner.id='paused-banner';
    banner.style.cssText='background:var(--ac);color:#fff;border-radius:12px;padding:14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:10px';
    banner.innerHTML=`
      <div>
        <div style="font-size:13px;font-weight:600">⏸ Entrenamiento pausado</div>
        <div style="font-size:12px;opacity:.85;margin-top:2px">${S.pausedWorkout.routineName}</div>
      </div>
      <button class="btn" style="background:#fff;color:var(--ac);border-color:#fff;font-weight:600;flex-shrink:0" onclick="resumeWorkout()"><i class="ti ti-player-play"></i> Retomar</button>`;
    document.querySelector('#s-home .cnt').insertBefore(banner, document.getElementById('pr-card'));
  }

  renderRoutinesSection();

  const hDiv = document.getElementById('home-hist');
  if(!S.sessions.length){ hDiv.innerHTML='<div class="empty" style="padding:16px"><i class="ti ti-history"></i>Sin sesiones.</div>'; }
  else hDiv.innerHTML = S.sessions.slice(-5).reverse().map(s=>`
    <div class="hist-item" onclick="openSessionDetail(${s.id})" style="cursor:pointer">
      <div style="font-weight:500;font-size:14px">${s.routineName}</div>
      <div style="font-size:12px;color:var(--t2);margin-top:2px">${s.date} · ${s.log.length} ejercicios · ${s.duration}</div>
    </div>`).join('');
  renderProfileCard();
}

// ---- HISTORY ----
function renderHistoryScreen(){
  const div = document.getElementById('history-list');
  if(!S.sessions.length){ div.innerHTML='<div class="empty"><i class="ti ti-history"></i>Sin sesiones registradas.</div>'; return; }
  div.innerHTML = [...S.sessions].reverse().map(s=>`
    <div class="card" style="cursor:pointer;margin-bottom:8px" onclick="openSessionDetail(${s.id})">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:500;font-size:15px">${s.routineName}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px">${s.date} · ${s.log.length} ejercicios · ${s.duration}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn xs" style="color:#dc2626;border-color:#dc2626" onclick="event.stopPropagation();confirmDeleteSession(${s.id})"><i class="ti ti-trash"></i></button>
          <i class="ti ti-chevron-right" style="color:var(--t3)"></i>
        </div>
      </div>
    </div>`).join('');
}

function confirmDeleteSession(id){
  deleteSessionConfirmId = id;
  const s = S.sessions.find(x=>x.id===id);
  if(!s) return;
  document.getElementById('del-sess-name').textContent = s.routineName + ' · ' + s.date;
  openModal('modal-del-session');
}

function deleteSession(){
  if(!deleteSessionConfirmId) return;
  S.sessions = S.sessions.filter(s=>s.id!==deleteSessionConfirmId);
  deleteSessionConfirmId=null;
  save(); renderHome(); renderHistoryScreen(); renderProgressSelect();
  closeModal('modal-del-session');
}

function openSessionDetail(id){
  const s = S.sessions.find(x=>x.id===id);
  if(!s) return;
  document.getElementById('detail-title').textContent = s.routineName;
  const div = document.getElementById('detail-content');
  div.innerHTML = `
    <div class="card" style="margin-bottom:10px">
      <div style="font-size:12px;color:var(--t2)">${s.date} · ${s.duration}</div>
    </div>
    ${s.log.map(ex=>`
      <div class="card" style="margin-bottom:8px">
        <div style="font-weight:500;font-size:15px;margin-bottom:10px">${ex.name}</div>
        <div style="display:grid;grid-template-columns:24px 1fr 1fr 1fr;gap:4px;margin-bottom:6px">
          <span style="font-size:10px;color:var(--t3)">#</span>
          <span style="font-size:10px;color:var(--t3)">Peso</span>
          <span style="font-size:10px;color:var(--t3)">Reps</span>
          <span style="font-size:10px;color:var(--t3)">Estado</span>
        </div>
        ${ex.sets.map((st,i)=>`
          <div style="display:grid;grid-template-columns:24px 1fr 1fr 1fr;gap:4px;padding:5px 0;border-bottom:0.5px solid var(--bd);align-items:center">
            <span style="font-size:12px;color:var(--t3)">${i+1}</span>
            <span style="font-size:13px">${st.kg||'—'} kg</span>
            <span style="font-size:13px">${st.reps||'—'} reps</span>
            <span style="font-size:11px;color:${st.hit===false?'#dc2626':st.done?'var(--ok)':'var(--t3)'}">${st.hit===false?'✗ Fallida':st.done?'✓ Hecha':'—'}</span>
          </div>`).join('')}
      </div>`).join('')}
    <div style="height:20px"></div>`;
  goTo('s-session-detail','');
}

// ---- PROGRESS ----
function renderProgressSelect(){
  const sel = document.getElementById('prog-sel');
  const prev = sel.value;
  const exNames = [...new Set(S.sessions.flatMap(s=>s.log.map(e=>e.name)))];
  sel.innerHTML = '<option value="">-- Selecciona --</option>' + exNames.map(n=>`<option value="${n}">${n}</option>`).join('');
  if(prev) sel.value = prev;
  renderProgress();
}

function renderProgress(){
  const name = document.getElementById('prog-sel').value;
  const wrap = document.getElementById('prog-content');
  if(!name){ wrap.innerHTML=''; return; }
  const data = [];
  S.sessions.forEach(sess=>{
    const ex = sess.log.find(e=>e.name===name);
    if(ex){
      const doneSets = ex.sets.filter(s=>s.done);
      if(!doneSets.length) return;
      const maxKg = Math.max(...doneSets.map(s=>parseFloat(s.kg)||0));
      const vol = doneSets.reduce((a,s)=>(parseFloat(s.kg)||0)*(parseInt(s.reps)||0)+a,0);
      data.push({date:sess.date, maxKg, vol, sets:doneSets.length});
    }
  });
  if(!data.length){ wrap.innerHTML='<div class="empty"><i class="ti ti-chart-line"></i>Sin datos.</div>'; return; }
  const maxVal = Math.max(...data.map(d=>d.maxKg))||1;
  wrap.innerHTML = `
    <div class="card"><div style="font-size:13px;color:var(--t2);margin-bottom:10px;font-weight:500">Peso máximo</div>
      <div class="pbar-wrap">
        ${data.slice(-8).map(d=>`
          <div class="pbar-row">
            <div class="pbar-lbl">${d.date.slice(5)}</div>
            <div class="pbar-bg"><div class="pbar-fill" style="width:${Math.round(d.maxKg/maxVal*100)}%"></div></div>
            <div class="pbar-val">${d.maxKg}kg</div>
          </div>`).join('')}
      </div>
    </div>
    <div class="card"><div style="font-size:13px;color:var(--t2);margin-bottom:8px;font-weight:500">Historial</div>
      ${data.slice(-6).reverse().map(d=>`
        <div style="padding:8px 0;border-bottom:0.5px solid var(--bd)">
          <div style="font-size:13px;font-weight:500">${d.date}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">Máx: ${d.maxKg}kg · Vol: ${d.vol}kg · ${d.sets} series</div>
        </div>`).join('')}
    </div>`;
}