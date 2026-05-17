// ---- RUTINAS POR DEFECTO ----

const DEFAULT_ROUTINES = [
  {
    id: 'tpl_ppl_push',
    name: 'Empuje (Pecho, Hombro, Tríceps)',
    tag: 'PPL · 3 días',
    exercises: [
      { name: 'Press banca', sets: [{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'}] },
      { name: 'Press inclinado mancuernas', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Aperturas en polea alta', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
      { name: 'Press militar barra', sets: [{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'}] },
      { name: 'Elevaciones laterales', sets: [{kg:'',reps:'15'},{kg:'',reps:'15'},{kg:'',reps:'15'}] },
      { name: 'Fondos en paralelas', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
    ]
  },
  {
    id: 'tpl_ppl_pull',
    name: 'Tirón (Espalda, Bíceps)',
    tag: 'PPL · 3 días',
    exercises: [
      { name: 'Peso muerto', sets: [{kg:'',reps:'5'},{kg:'',reps:'5'},{kg:'',reps:'5'}] },
      { name: 'Dominadas', sets: [{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'}] },
      { name: 'Remo con barra', sets: [{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'}] },
      { name: 'Pulldown en polea', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Curl bíceps barra', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Curl martillo', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'}] },
    ]
  },
  {
    id: 'tpl_ppl_legs',
    name: 'Piernas (Cuádriceps, Isquios, Glúteos)',
    tag: 'PPL · 3 días',
    exercises: [
      { name: 'Sentadilla barra', sets: [{kg:'',reps:'6'},{kg:'',reps:'6'},{kg:'',reps:'6'},{kg:'',reps:'6'}] },
      { name: 'Prensa de piernas', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Extensión de cuádriceps', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
      { name: 'Curl femoral tumbado', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
      { name: 'Hip thrust', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Gemelos de pie', sets: [{kg:'',reps:'15'},{kg:'',reps:'15'},{kg:'',reps:'15'}] },
    ]
  },
  {
    id: 'tpl_fullbody_a',
    name: 'Full Body A',
    tag: 'Full Body · 3 días',
    exercises: [
      { name: 'Sentadilla barra', sets: [{kg:'',reps:'5'},{kg:'',reps:'5'},{kg:'',reps:'5'}] },
      { name: 'Press banca', sets: [{kg:'',reps:'5'},{kg:'',reps:'5'},{kg:'',reps:'5'}] },
      { name: 'Remo con barra', sets: [{kg:'',reps:'5'},{kg:'',reps:'5'},{kg:'',reps:'5'}] },
    ]
  },
  {
    id: 'tpl_fullbody_b',
    name: 'Full Body B',
    tag: 'Full Body · 3 días',
    exercises: [
      { name: 'Sentadilla barra', sets: [{kg:'',reps:'5'},{kg:'',reps:'5'},{kg:'',reps:'5'}] },
      { name: 'Press militar barra', sets: [{kg:'',reps:'5'},{kg:'',reps:'5'},{kg:'',reps:'5'}] },
      { name: 'Peso muerto', sets: [{kg:'',reps:'5'}] },
    ]
  },
  {
    id: 'tpl_upper',
    name: 'Tren Superior',
    tag: 'Upper/Lower · 4 días',
    exercises: [
      { name: 'Press banca', sets: [{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'}] },
      { name: 'Remo con mancuerna', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Press militar mancuernas', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Curl bíceps', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
      { name: 'Extensión tríceps polea', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
    ]
  },
  {
    id: 'tpl_lower',
    name: 'Tren Inferior',
    tag: 'Upper/Lower · 4 días',
    exercises: [
      { name: 'Sentadilla barra', sets: [{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'},{kg:'',reps:'8'}] },
      { name: 'Peso muerto rumano', sets: [{kg:'',reps:'10'},{kg:'',reps:'10'},{kg:'',reps:'10'}] },
      { name: 'Prensa de piernas', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
      { name: 'Curl femoral sentado', sets: [{kg:'',reps:'12'},{kg:'',reps:'12'},{kg:'',reps:'12'}] },
      { name: 'Gemelos sentado', sets: [{kg:'',reps:'15'},{kg:'',reps:'15'},{kg:'',reps:'15'}] },
    ]
  },
];

// ---- Clona una plantilla a las rutinas del usuario ----
function cloneTemplate(tplId) {
  const tpl = DEFAULT_ROUTINES.find(r => r.id === tplId);
  if (!tpl) return;
  // Comprobar si ya existe una copia con ese nombre
  const alreadyExists = S.routines.some(r => r.name === tpl.name);
  if (alreadyExists) {
    alert(`Ya tienes una rutina llamada "${tpl.name}" en Mis rutinas.`);
    return;
  }
  const clone = {
    id: Date.now(),
    name: tpl.name,
    exercises: JSON.parse(JSON.stringify(tpl.exercises))
  };
  S.routines.unshift(clone);
  save();
  renderHome();
  // Feedback visual
  showToast(`✓ "${tpl.name}" añadida a Mis rutinas`);
}

// ---- Petición a la IA para generar rutinas personalizadas ----
let aiRoutineBusy = false;

async function requestAIRoutines() {
  if (aiRoutineBusy) return;
  const desc = document.getElementById('ai-routine-desc').value.trim();
  if (!desc) { alert('Describe qué tipo de rutina quieres.'); return; }

  if (!S.apiConfig?.key) {
    showToast('Añade tu API key en Ajustes primero');
    goTo('s-settings', 'mi-settings');
    closeModal('modal-ai-routines');
    return;
  }

  const btn = document.getElementById('ai-routine-btn');
  const out = document.getElementById('ai-routine-out');
  aiRoutineBusy = true;
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Generando...';
  out.innerHTML = '<div style="font-size:13px;color:var(--t2);text-align:center;padding:12px">La IA está creando tus rutinas...</div>';

  const systemPrompt = `Eres un entrenador personal experto. El usuario te pedirá un programa de entrenamiento. 
Debes responder ÚNICAMENTE con un array JSON válido (sin texto adicional, sin markdown, sin bloques de código).
Cada elemento del array es una rutina con esta estructura exacta:
{"name":"string","exercises":[{"name":"string","sets":[{"kg":"","reps":"N"}]}]}
- "kg" siempre string vacío "".
- "reps" siempre string con el número de repeticiones recomendadas.
- Genera entre 2 y 4 rutinas según lo que pida el usuario.
- Nombres de ejercicios en español.`;

  try {
    const raw = await callAI([{ role: 'user', content: desc }], systemPrompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const routines = JSON.parse(clean);
    if (!Array.isArray(routines) || !routines.length) throw new Error('Formato inválido');
    renderAIRoutineSuggestions(routines);
  } catch (e) {
    out.innerHTML = `<div style="font-size:13px;color:#dc2626;text-align:center;padding:12px">
      Error al generar rutinas: ${e.message}. Comprueba tu API key en Ajustes.</div>`;
  }
  aiRoutineBusy = false;
  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generar rutinas';
}

function renderAIRoutineSuggestions(routines) {
  const out = document.getElementById('ai-routine-out');
  out.innerHTML = routines.map((r, i) => `
    <div class="card" style="margin-bottom:8px;padding:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <div style="font-size:14px;font-weight:500;margin-bottom:4px">${esc(r.name)}</div>
          <div style="font-size:12px;color:var(--t3)">${r.exercises.length} ejercicios · ${r.exercises.reduce((a,e)=>a+e.sets.length,0)} series</div>
        </div>
        <button class="btn xs ac" onclick="addAIRoutine(${i}, aiSuggestions)">
          <i class="ti ti-plus"></i> Añadir
        </button>
      </div>
    </div>`).join('');
  // Guardar referencia global temporal
  window.aiSuggestions = routines;
}

function addAIRoutine(index, routines) {
  const r = routines[index];
  if (!r) return;
  const alreadyExists = S.routines.some(x => x.name === r.name);
  if (alreadyExists) { alert(`Ya tienes "${r.name}" en Mis rutinas.`); return; }
  S.routines.unshift({ id: Date.now(), name: r.name, exercises: r.exercises });
  save();
  renderHome();
  showToast(`✓ "${r.name}" añadida a Mis rutinas`);
}

// ---- Toast feedback ----
function showToast(msg) {
  let t = document.getElementById('gt-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'gt-toast';
    t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:var(--ok);color:#fff;padding:8px 18px;border-radius:20px;
      font-size:13px;font-weight:500;z-index:9999;opacity:0;transition:opacity .2s;
      white-space:nowrap;pointer-events:none;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._to);
  t._to = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}
