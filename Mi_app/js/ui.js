// ---- NAV ----
function goTo(sid, mid){
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
  document.getElementById(sid).classList.add('on');
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active-section'));
  if(mid) document.getElementById(mid)?.classList.add('active-section');
  closeMenu();
  hideFab(sid==='s-workout'||sid==='s-history'||sid==='s-session-detail');
  if(sid==='s-history') renderHistoryScreen();
}

function hideFab(hide){ document.getElementById('fab-btn').style.display = hide?'none':'flex'; }
function toggleMenu(){ document.getElementById('menu-overlay').classList.toggle('on'); document.getElementById('menu-sheet').classList.toggle('on'); }
function closeMenu(){ document.getElementById('menu-overlay').classList.remove('on'); document.getElementById('menu-sheet').classList.remove('on'); }
function openModal(id){ document.getElementById(id).classList.add('on'); }
function closeModal(id){ document.getElementById(id).classList.remove('on'); }

// Utilidades de formato
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function fmtMd(t){
  return esc(t).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/^- (.+)$/gm,'<div style="padding-left:10px;margin:2px 0">• $1</div>').replace(/\n/g,'<br>');
}