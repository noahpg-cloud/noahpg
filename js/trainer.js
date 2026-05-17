// ---- CHAT ----
function chatKey(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();} }

function sendQ(msg){ document.getElementById('chat-in').value=msg; sendChat(); }

// ---- Llamada unificada a la API según proveedor configurado ----
async function callAI(messages, systemPrompt) {
  const { provider, key } = S.apiConfig;
  if (!key) throw new Error('NO_KEY');

  // OpenRouter y Groq usan formato compatible con OpenAI
  const openAICompatProviders = ['openrouter', 'groq'];

  if (openAICompatProviders.includes(provider)) {
    const configs = {
      openrouter: {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        extraHeaders: { 'HTTP-Referer': 'https://gymtracker.app', 'X-Title': 'GymTracker AI' }
      },
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        extraHeaders: {}
      }
    };
    const cfg = configs[provider];
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        ...cfg.extraHeaders
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000
      })
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
    return d.choices?.[0]?.message?.content || '';
  }

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages })
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message || 'Claude error');
    return d.content?.map(c => c.text || '').join('') || '';
  }

  throw new Error('Proveedor no configurado correctamente');
}

async function sendChat(){
  if(chatBusy) return;
  const inp = document.getElementById('chat-in');
  const msg = inp.value.trim(); if(!msg) return;

  if (!S.apiConfig?.key) {
    showToast('Añade tu API key en Ajustes');
    goTo('s-settings', 'mi-settings');
    initApiConfigUI();
    return;
  }

  inp.value='';
  S.chatHistory.push({role:'user',content:msg});
  renderChatMsgs();
  scrollChat();
  chatBusy=true;

  const typing=document.createElement('div');
  typing.className='chat-msg a';
  typing.innerHTML='<span style="letter-spacing:3px;color:var(--t2)">···</span>';
  document.getElementById('chat-msgs').appendChild(typing);
  scrollChat();

  try{
    const profileCtx = typeof buildProfileContext === 'function' ? buildProfileContext() : '';
    const sys=`Eres un entrenador personal experto. Responde siempre en español, de forma clara y con terminología técnica cuando sea apropiado. Usa formato limpio sin markdown excesivo.${profileCtx}`;
    const reply = await callAI(S.chatHistory.slice(-10), sys);
    S.chatHistory.push({role:'assistant',content:reply});
    typing.remove();
    renderChatMsgs(); scrollChat(); save();
  }catch(e){
    typing.remove();
    const errMsg = e.message === 'NO_KEY'
      ? 'Añade tu API key en Ajustes para usar el chat.'
      : `Error: ${e.message}`;
    S.chatHistory.push({role:'assistant',content:errMsg});
    renderChatMsgs(); scrollChat();
  }
  chatBusy=false;
}

function renderChatMsgs(){
  document.getElementById('chat-msgs').innerHTML=S.chatHistory.map(m=>`
    <div class="chat-msg ${m.role==='user'?'u':'a'}">${m.role==='assistant'?fmtMd(m.content):esc(m.content)}</div>`).join('');
}

function scrollChat(){ const c=document.getElementById('chat-cnt'); setTimeout(()=>{c.scrollTop=c.scrollHeight;},50); }
