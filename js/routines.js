// ---- ARCHIVE ----
function toggleArchiveRoutine(id) {
  const r = S.routines.find(x => x.id === id);
  if (!r) return;
  r.archived = !r.archived;
  save();
  renderHome();
}

// ---- ROUTINES RENDER (includes templates dropdown) ----
function renderRoutinesSection() {
  const wrap = document.getElementById('home-routines-wrap');
  if (!wrap) return;

  const active   = S.routines.filter(r => !r.archived);
  const archived = S.routines.filter(r => r.archived);

  // State: are templates expanded?
  const tplOpen = wrap.dataset.tplOpen === '1';
  const arcOpen = wrap.dataset.arcOpen === '1';

  // Build active routines HTML
  const activeHtml = active.length
    ? active.map(r => routineItemHtml(r, false)).join('')
    : '<div style="font-size:13px;color:var(--t2);text-align:center;padding:10px 0">Sin rutinas activas. Crea la primera.</div>';

  // Build archived section HTML
  const archivedHtml = archived.length ? `
    <button onclick="toggleArcSection()" style="width:100%;background:none;border:none;
      display:flex;align-items:center;justify-content:space-between;
      padding:8px 0;cursor:pointer;color:var(--t3)">
      <span style="font-size:12px;font-weight:500">
        <i class="ti ti-archive" style="margin-right:4px"></i>Archivadas (${archived.length})
      </span>
      <i class="ti ti-chevron-${arcOpen?'up':'down'}" style="font-size:14px"></i>
    </button>
    ${arcOpen ? archived.map(r => routineItemHtml(r, true)).join('') : ''}
  ` : '';

  // Build templates dropdown HTML
  const groups = {};
  DEFAULT_ROUTINES.forEach(r => {
    if (!groups[r.tag]) groups[r.tag] = [];
    groups[r.tag].push(r);
  });
  const tplListHtml = Object.entries(groups).map(([tag, routines]) => `
    <div style="margin-bottom:4px">
      <div style="font-size:10px;color:var(--t3);font-weight:600;letter-spacing:.5px;
                  text-transform:uppercase;margin:8px 0 4px;padding-left:2px">${esc(tag)}</div>
      ${routines.map(r => {
        const added = S.routines.some(x => x.name === r.name);
        return `<div style="display:flex;align-items:center;justify-content:space-between;
                  padding:8px 10px;background:var(--bg2);border-radius:8px;margin-bottom:4px;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:500;color:var(--t1);
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.name)}</div>
            <div style="font-size:11px;color:var(--t3);margin-top:1px">
              ${r.exercises.length} ejercicios · ${r.exercises.reduce((a,e)=>a+e.sets.length,0)} series
            </div>
          </div>
          ${added
            ? `<span style="font-size:11px;color:var(--ok);font-weight:500;white-space:nowrap"><i class="ti ti-check"></i> Añadida</span>`
            : `<button class="btn xs ac" onclick="cloneTemplate('${r.id}')"><i class="ti ti-copy-plus"></i> Usar</button>`
          }
        </div>`;
      }).join('')}
    </div>`).join('');

  const tplHtml = `
    <div style="border-top:0.5px solid var(--bd);margin-top:6px;padding-top:4px">
      <button onclick="toggleTplSection()" style="width:100%;background:none;border:none;
        display:flex;align-items:center;justify-content:space-between;
        padding:8px 0;cursor:pointer;color:var(--t3)">
        <span style="font-size:12px;font-weight:500">
          <i class="ti ti-books" style="margin-right:4px"></i>Rutinas de ejemplo
        </span>
        <div style="display:flex;align-items:center;gap:8px">
          <span onclick="event.stopPropagation();openModal('modal-ai-routines')"
            style="font-size:11px;color:var(--ac);font-weight:500">
            <i class="ti ti-wand"></i> Pedir a la IA
          </span>
          <i class="ti ti-chevron-${tplOpen?'up':'down'}" style="font-size:14px"></i>
        </div>
      </button>
      ${tplOpen ? `<div style="padding-bottom:4px">${tplListHtml}</div>` : ''}
    </div>`;

  wrap.innerHTML = `
    ${activeHtml}
    ${archivedHtml}
    <button class="btn full" style="margin-top:8px" onclick="openNewRoutine()">
      <i class="ti ti-plus"></i> Nueva rutina
    </button>
    ${tplHtml}`;
}

function routineItemHtml(r, isArchived) {
  return `<div class="routine-item" style="${isArchived ? 'opacity:.6' : ''}">
    <div class="routine-icon"><i class="ti ti-barbell"></i></div>
    <div class="routine-info">
      <div class="routine-name">${esc(r.name)}</div>
      <div class="routine-sub">${r.exercises.length} ejercicios · ${r.exercises.reduce((a,e)=>a+e.sets.length,0)} series</div>
    </div>
    ${!isArchived
      ? `<button class="btn sm" onclick="startWorkout(${r.id})" style="background:var(--ac);color:#fff;border-color:var(--ac)"><i class="ti ti-player-play"></i></button>`
      : ''
    }
    <button class="btn sm ghost" onclick="${isArchived ? '' : `editRoutine(${r.id})`}" 
      ${isArchived ? 'style="display:none"' : ''}><i class="ti ti-edit"></i></button>
    <button class="btn sm ghost" title="${isArchived ? 'Restaurar' : 'Archivar'}"
      onclick="toggleArchiveRoutine(${r.id})">
      <i class="ti ti-${isArchived ? 'archive-off' : 'archive'}"></i>
    </button>
    <button class="btn sm ghost" onclick="deleteRoutine(${r.id})"><i class="ti ti-trash"></i></button>
  </div>`;
}

function toggleTplSection() {
  const wrap = document.getElementById('home-routines-wrap');
  if (!wrap) return;
  wrap.dataset.tplOpen = wrap.dataset.tplOpen === '1' ? '0' : '1';
  renderRoutinesSection();
}

function toggleArcSection() {
  const wrap = document.getElementById('home-routines-wrap');
  if (!wrap) return;
  wrap.dataset.arcOpen = wrap.dataset.arcOpen === '1' ? '0' : '1';
  renderRoutinesSection();
}

// Keep renderTemplates as no-op for backwards compat
function renderTemplates() { renderRoutinesSection(); }

// ---- ROUTINES ----
function openNewRoutine(){
  editRoutineId = null;
  rutineExercises = [];
  document.getElementById('rut-name').value = '';
  document.getElementById('rut-modal-title').textContent = 'Nueva rutina';
  document.getElementById('rut-exercises-wrap').innerHTML = '';
  openModal('modal-rut');
}

function editRoutine(id){
  const r = S.routines.find(x=>x.id===id); if(!r) return;
  editRoutineId = id;
  rutineExercises = JSON.parse(JSON.stringify(r.exercises));
  document.getElementById('rut-name').value = r.name;
  document.getElementById('rut-modal-title').textContent = 'Editar rutina';
  renderRoutineForm();
  openModal('modal-rut');
}

function deleteRoutine(id){
  if(!confirm('¿Eliminar esta rutina?')) return;
  S.routines = S.routines.filter(r=>r.id!==id);
  save(); renderHome();
}

function addExToRoutine(){
  rutineExercises.push({name:'', sets:[{kg:'',reps:''}]});
  renderRoutineForm();
}

function renderRoutineForm(){
  document.getElementById('rut-exercises-wrap').innerHTML = rutineExercises.map((ex,i)=>`
    <div class="card" style="margin-top:10px;padding:12px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <input type="text" placeholder="Nombre del ejercicio" value="${ex.name}" style="flex:1" onchange="rutineExercises[${i}].name=this.value">
        <button class="btn xs ghost" onclick="rutineExercises.splice(${i},1);renderRoutineForm()"><i class="ti ti-trash"></i></button>
      </div>
      <div style="display:grid;grid-template-columns:16px 1fr 1fr 28px;gap:6px;align-items:center;margin-bottom:4px">
        <span style="font-size:10px;color:var(--t3)">#</span>
        <span style="font-size:10px;color:var(--t3);text-align:center">kg</span>
        <span style="font-size:10px;color:var(--t3);text-align:center">reps</span>
        <span></span>
      </div>
      ${ex.sets.map((s,j)=>`
        <div style="display:grid;grid-template-columns:16px 1fr 1fr 28px;gap:6px;align-items:center;margin-bottom:6px">
          <span style="font-size:11px;color:var(--t2);text-align:center">${j+1}</span>
          <input type="number" placeholder="kg" value="${s.kg}" min="0" step="0.5" onchange="rutineExercises[${i}].sets[${j}].kg=this.value">
          <input type="number" placeholder="reps" value="${s.reps}" min="1" onchange="rutineExercises[${i}].sets[${j}].reps=this.value">
          ${j>0?`<button class="btn xs ghost" onclick="rutineExercises[${i}].sets.splice(${j},1);renderRoutineForm()"><i class="ti ti-x"></i></button>`:'<span></span>'}
        </div>`).join('')}
      <button class="btn xs full" onclick="rutineExercises[${i}].sets.push({kg:'',reps:''});renderRoutineForm()"><i class="ti ti-plus"></i> Serie</button>
    </div>`).join('');
}

function saveRoutine(){
  const name = document.getElementById('rut-name').value.trim();
  if(!name){ alert('Ponle un nombre a la rutina'); return; }
  if(!rutineExercises.length){ alert('Añade al menos un ejercicio'); return; }
  const exs = rutineExercises.filter(e=>e.name.trim());
  if(!exs.length){ alert('Pon nombre a los ejercicios'); return; }
  if(editRoutineId){
    const r = S.routines.find(x=>x.id===editRoutineId);
    if(r){ r.name=name; r.exercises=exs; }
  } else {
    S.routines.push({id:Date.now(), name, exercises:exs});
  }
  closeModal('modal-rut');
  save();
  try { renderHome(); } catch(e) { console.error('renderHome error:', e); }
}