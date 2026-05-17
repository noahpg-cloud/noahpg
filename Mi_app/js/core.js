// ---- STATE ----
let S = {routines:[], sessions:[], chatHistory:[], pausedWorkout:null, apiConfig:{provider:'openrouter', key:''}, profile:{name:'', weight:'', height:'', age:'', sex:'male', bf:'', activity:'moderate', intensity:'medium', steps:'', goal:'hypertrophy', goalWeight:'', goalNote:''}};
let editRoutineId = null;
let rutineExercises = [];
let workout = null;
let wkTimer = null;
let wkSeconds = 0;
let chatBusy = false;
let deleteSessionConfirmId = null;

async function load(){
  try{
    const data = localStorage.getItem('gmt2');
    if(data){ S = JSON.parse(data); if(!S.pausedWorkout) S.pausedWorkout=null; if(!S.chatHistory) S.chatHistory=[]; if(!S.apiConfig) S.apiConfig={provider:'openrouter', key:''}; if(!S.profile) S.profile={name:'',weight:'',height:'',age:'',sex:'male',bf:'',activity:'moderate',intensity:'medium',steps:'',goal:'hypertrophy',goalWeight:'',goalNote:''}; }
  }catch(e){}
  renderHome(); renderProgressSelect();
}

async function save(){ try{ localStorage.setItem('gmt2', JSON.stringify(S)); }catch(e){} }

function exportData(){
  const json = JSON.stringify(S, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `gymtracker-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e){
  const file = e.target.files[0]; if(!file) return;
  const msg = document.getElementById('import-msg');
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const data = JSON.parse(ev.target.result);
      if(!data.routines || !data.sessions) throw new Error('Formato incorrecto');
      if(!confirm(`¿Importar datos? Se importarán ${data.routines.length} rutinas y ${data.sessions.length} sesiones. Esto reemplazará los datos actuales.`)) return;
      S = data;
      if(!S.chatHistory) S.chatHistory = [];
      save(); renderHome(); renderProgressSelect();
      msg.style.color = 'var(--ok)';
      msg.textContent = '✓ Datos importados correctamente';
    }catch(err){
      msg.style.color = '#dc2626';
      msg.textContent = '✗ Archivo inválido. Usa un backup de GymTracker.';
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

function clearAllData(){
  if(!confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) return;
  S = {routines:[], sessions:[], chatHistory:[]};
  save(); renderHome(); renderProgressSelect();
  alert('Datos borrados correctamente.');
}
// ---- API CONFIG ----
function saveApiConfig() {
  const provider = document.getElementById('api-provider')?.value || 'gemini';
  const key = document.getElementById('api-key-input')?.value || '';
  if (!S.apiConfig) S.apiConfig = {};
  S.apiConfig.provider = provider;
  S.apiConfig.key = key;
  save();
  // Mostrar estado
  const status = document.getElementById('api-status');
  if (status) {
    if (key) {
      status.style.color = 'var(--ok)';
      status.textContent = '✓ API key guardada';
    } else {
      status.style.color = 'var(--t3)';
      status.textContent = 'Sin API key — el chat no funcionará';
    }
  }
}

function toggleApiKeyVisibility() {
  const inp = document.getElementById('api-key-input');
  const icon = document.getElementById('api-eye-icon');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'ti ti-eye-off';
  } else {
    inp.type = 'password';
    icon.className = 'ti ti-eye';
  }
}

function initApiConfigUI() {
  const providerEl = document.getElementById('api-provider');
  const keyEl = document.getElementById('api-key-input');
  const status = document.getElementById('api-status');
  if (!providerEl || !keyEl) return;
  const cfg = S.apiConfig || { provider: 'gemini', key: '' };
  providerEl.value = cfg.provider || 'openrouter';
  updateApiHint();
  keyEl.value = cfg.key || '';
  if (status) {
    if (cfg.key) {
      status.style.color = 'var(--ok)';
      status.textContent = '✓ API key guardada';
    } else {
      status.style.color = 'var(--t3)';
      status.textContent = 'Sin API key — el chat no funcionará';
    }
  }
}

function updateApiHint() {
  const provider = document.getElementById('api-provider')?.value;
  const hint = document.getElementById('api-hint');
  if (!hint) return;
  const hints = {
    openrouter: 'Consigue tu key gratis en <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--ac)">openrouter.ai/keys</a> — sin tarjeta, funciona desde España.',
    groq: 'Consigue tu key gratis en <a href="https://console.groq.com/keys" target="_blank" style="color:var(--ac)">console.groq.com</a> — sin tarjeta, muy rápido.',
    claude: 'Requiere cuenta de pago en <a href="https://console.anthropic.com" target="_blank" style="color:var(--ac)">console.anthropic.com</a>.'
  };
  hint.innerHTML = hints[provider] || '';
}

// ---- PROFILE ----
const ACTIVITY_FACTORS = {
  sedentary:  {label:'Sedentario (sin ejercicio)',      val:1.2},
  light:      {label:'Ligero (1-2 días/semana)',        val:1.375},
  moderate:   {label:'Moderado (3-5 días/semana)',      val:1.55},
  active:     {label:'Activo (6-7 días/semana)',        val:1.725},
  very_active:{label:'Muy activo (2x día o trabajo físico)', val:1.9}
};

const GOALS = {
  hypertrophy: {label:'Volumen / Hipertrofia', kcalAdj: +300},
  strength:    {label:'Fuerza',                kcalAdj: +150},
  fat_loss:    {label:'Perder grasa',          kcalAdj: -400},
  maintenance: {label:'Mantenimiento',         kcalAdj: 0}
};

function calcProfile(p) {
  const w = parseFloat(p.weight), h = parseFloat(p.height),
        a = parseFloat(p.age),   bf = parseFloat(p.bf);
  if (!w || !h || !a) return null;

  // BMI
  const bmi = w / ((h/100) ** 2);
  const bmiLabel = bmi < 18.5 ? 'Bajo peso' : bmi < 25 ? 'Normopeso' : bmi < 30 ? 'Sobrepeso' : 'Obesidad';

  // BMR — Katch-McArdle if body fat known, else Mifflin-St Jeor
  let bmr;
  if (!isNaN(bf) && bf > 0) {
    const lbm = w * (1 - bf/100);
    bmr = 370 + 21.6 * lbm;                          // Katch-McArdle
  } else {
    bmr = p.sex === 'female'
      ? 10*w + 6.25*h - 5*a - 161                    // Mifflin mujer
      : 10*w + 6.25*h - 5*a + 5;                     // Mifflin hombre
  }

  const actFactor = ACTIVITY_FACTORS[p.activity]?.val || 1.55;
  const tdee = Math.round(bmr * actFactor);
  const goalAdj = GOALS[p.goal]?.kcalAdj || 0;
  const targetKcal = tdee + goalAdj;

  // Macro split based on goal
  const splits = {
    hypertrophy: {p:0.30, f:0.25, c:0.45},
    strength:    {p:0.30, f:0.28, c:0.42},
    fat_loss:    {p:0.38, f:0.30, c:0.32},
    maintenance: {p:0.28, f:0.28, c:0.44}
  };
  const sp = splits[p.goal] || splits.maintenance;
  const macros = {
    protein: Math.round(targetKcal * sp.p / 4),
    fat:     Math.round(targetKcal * sp.f / 9),
    carbs:   Math.round(targetKcal * sp.c / 4)
  };

  return {bmi: bmi.toFixed(1), bmiLabel, bmr: Math.round(bmr), tdee, targetKcal, macros};
}

function openProfileModal() {
  const p = S.profile;
  document.getElementById('pf-name').value     = p.name     || '';
  document.getElementById('pf-weight').value   = p.weight   || '';
  document.getElementById('pf-height').value   = p.height   || '';
  document.getElementById('pf-age').value      = p.age      || '';
  document.getElementById('pf-sex').value      = p.sex      || 'male';
  document.getElementById('pf-bf').value        = p.bf        || '';
  document.getElementById('pf-activity').value  = p.activity  || 'moderate';
  document.getElementById('pf-intensity').value = p.intensity || 'medium';
  const stepsEl = document.getElementById('pf-steps'); if(stepsEl) stepsEl.value = p.steps || '';
  document.getElementById('pf-goal').value     = p.goal     || 'hypertrophy';
  document.getElementById('pf-goal-weight').value = p.goalWeight || '';
  document.getElementById('pf-goal-note').value   = p.goalNote   || '';
  openModal('modal-profile');
}

function saveProfile() {
  S.profile = {
    name:        document.getElementById('pf-name').value.trim(),
    weight:      document.getElementById('pf-weight').value,
    height:      document.getElementById('pf-height').value,
    age:         document.getElementById('pf-age').value,
    sex:         document.getElementById('pf-sex').value,
    bf:          document.getElementById('pf-bf').value,
    activity:    document.getElementById('pf-activity').value,
    intensity:   document.getElementById('pf-intensity')?.value || 'medium',
    steps:       document.getElementById('pf-steps')?.value || '',
    goal:        document.getElementById('pf-goal').value,
    goalWeight:  document.getElementById('pf-goal-weight').value,
    goalNote:    document.getElementById('pf-goal-note').value.trim()
  };
  save();
  closeModal('modal-profile');
  renderHome();
}

function buildProfileContext() {
  const p = S.profile;
  if (!p || !p.weight) return '';
  const calc = calcProfile(p);
  const goalLabel = GOALS[p.goal]?.label || p.goal;
  const actLabel  = ACTIVITY_FACTORS[p.activity]?.label || p.activity;
  let ctx = `\n\n--- PERFIL DEL USUARIO ---`;
  if (p.name)   ctx += `\nNombre: ${p.name}`;
  ctx += `\nPeso: ${p.weight}kg | Altura: ${p.height}cm | Edad: ${p.age} años | Sexo: ${p.sex === 'female' ? 'Mujer' : 'Hombre'}`;
  if (p.bf)     ctx += ` | % Grasa aprox: ${p.bf}%`;
  const intensityLabel = {low:'Baja', medium:'Media', high:'Alta'}[p.intensity] || '';
  ctx += `\nActividad: ${actLabel} | Intensidad: ${intensityLabel}`;
  if (p.steps) ctx += ` | Pasos/día: ~${p.steps}`;
  ctx += `\nObjetivo principal: ${goalLabel}`;
  if (p.goalWeight) ctx += ` | Meta de peso: ${p.goalWeight}kg`;
  if (p.goalNote)   ctx += ` | Nota: ${p.goalNote}`;
  if (calc) {
    ctx += `\nIMC: ${calc.bmi} (${calc.bmiLabel}) | TDEE: ${calc.tdee} kcal | Calorías objetivo: ${calc.targetKcal} kcal`;
    ctx += `\nMacros sugeridos: ${calc.macros.protein}g proteína · ${calc.macros.carbs}g carbos · ${calc.macros.fat}g grasa`;
  }
  ctx += `\n--------------------------\nTen en cuenta este perfil en todas tus respuestas. Personaliza los consejos a este usuario específico.`;
  return ctx;
}
