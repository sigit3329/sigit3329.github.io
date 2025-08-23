// app.js — Ducky Script → Arduino (Keyboard.h), modern UI
(function(){
  const html = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') html.setAttribute('data-theme', stored);
  else html.setAttribute('data-theme', 'system');
  document.getElementById('year').textContent = new Date().getFullYear();

  document.getElementById('themeToggle').addEventListener('click', () => {
    const cycle = ['system','light','dark'];
    const curr = html.getAttribute('data-theme') || 'system';
    const next = cycle[(cycle.indexOf(curr)+1)%cycle.length];
    html.setAttribute('data-theme', next);
    if (next === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', next);
  });

  const el = (id) => document.getElementById(id);
  const ducky = el('ducky');
  const out   = el('arduino');

  // Key map Ducky -> Arduino Keyboard.h
  const keyMap = {
    'ENTER':'KEY_RETURN','RETURN':'KEY_RETURN',
    'TAB':'KEY_TAB','ESCAPE':'KEY_ESC','ESC':'KEY_ESC','SPACE':' ',
    'BACKSPACE':'KEY_BACKSPACE','DELETE':'KEY_DELETE',
    'UP':'KEY_UP_ARROW','DOWN':'KEY_DOWN_ARROW','LEFT':'KEY_LEFT_ARROW','RIGHT':'KEY_RIGHT_ARROW',
    'HOME':'KEY_HOME','END':'KEY_END','PAGEUP':'KEY_PAGE_UP','PAGEDOWN':'KEY_PAGE_DOWN',
    'CAPSLOCK':'KEY_CAPS_LOCK',
    'F1':'KEY_F1','F2':'KEY_F2','F3':'KEY_F3','F4':'KEY_F4','F5':'KEY_F5','F6':'KEY_F6',
    'F7':'KEY_F7','F8':'KEY_F8','F9':'KEY_F9','F10':'KEY_F10','F11':'KEY_F11','F12':'KEY_F12'
  };
  const modMap = {
    'CTRL':'KEY_LEFT_CTRL','CONTROL':'KEY_LEFT_CTRL',
    'ALT':'KEY_LEFT_ALT',
    'SHIFT':'KEY_LEFT_SHIFT',
    'GUI':'KEY_LEFT_GUI','WINDOWS':'KEY_LEFT_GUI','WIN':'KEY_LEFT_GUI','COMMAND':'KEY_LEFT_GUI'
  };

  function escStr(s){
    return s.replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  }

  function pressCombo(tokens){
    // tokens e.g. ['CTRL','ALT','DELETE'] or ['GUI','r']
    const presses = tokens.map(t => (modMap[t] || keyMap[t] || t)).map(k => k.length===1 ? `"${k}"` : k);
    // In Arduino, Keyboard.press for each, then releaseAll
    let code = '';
    tokens.forEach(t => {
      const k = (modMap[t] || keyMap[t] || t);
      if (k.length === 1) code += `  Keyboard.press('${k}');\n`;
      else code += `  Keyboard.press(${k});\n`;
    });
    code += `  delay(D_DELAY);\n  Keyboard.releaseAll();\n`;
    return code;
  }

  function toArduino(src){
    const lines = src.replace(/\r\n/g,'\n').split('\n');
    const includeComments = el('includeComments').checked;
    const DEFAULT_DELAY = Math.max(0, Number(el('defaultDelay').value) || 0);
    const ENTER_DELAY   = Math.max(0, Number(el('enterDelay').value) || 0);
    let lastAction = '';
    let body = '';

    for (let raw of lines){
      const line = raw.trim();
      if (!line){ continue; }
      // Comments
      if (/^REM\s/i.test(line)){
        if (includeComments) body += `  // ${line.replace(/^REM\s*/i,'')}\n`;
        continue;
      }
      // DEFAULT_DELAY / DEFAULTDELAY
      if (/^DEFAULT_?DELAY\s+/i.test(line)){
        const n = Number(line.split(/\s+/)[1]) || DEFAULT_DELAY;
        body += `  D_DELAY = ${n};\n`; 
        continue;
      }
      // DELAY
      if (/^DELAY\s+/i.test(line)){
        const n = Number(line.split(/\s+/)[1]) || 0;
        body += `  delay(${n});\n`;
        lastAction = `  delay(${n});\n`;
        continue;
      }
      // STRING
      if (/^STRING\s+/i.test(line)){
        const txt = line.replace(/^STRING\s+/i,'');
        body += `  Keyboard.print("${escStr(txt)}");\n  delay(D_DELAY);\n`;
        lastAction = `  Keyboard.print("${escStr(txt)}");\n  delay(D_DELAY);\n`;
        continue;
      }
      // STRING_DELAY (basic support: STRING_DELAY 5 Hello)
      if (/^STRING_DELAY\s+/i.test(line)){
        const parts = line.split(/\s+/);
        const perChar = Number(parts[1])||0;
        const txt = parts.slice(2).join(' ');
        body += `  for (const char* p="${escStr(txt)}"; *p; ++p){ Keyboard.print(*p); delay(${perChar}); }\n  delay(D_DELAY);\n`;
        lastAction = `  for (const char* p="${escStr(txt)}"; *p; ++p){ Keyboard.print(*p); delay(${perChar}); }\n  delay(D_DELAY);\n`;
        continue;
      }
      // REPEAT n
      if (/^REPEAT\s+/i.test(line)){
        const n = Number(line.split(/\s+/)[1])||1;
        if (lastAction){
          body += `  for (int i=0;i<${n};++i){\n${lastAction.replace(/^/gm,'    ')}  }\n`;
        }
        continue;
      }

      // Single key tokens or combos
      const tokens = line.split(/\s+/).map(t => t.toUpperCase());
      // One token that's a special key
      if (tokens.length === 1 && (keyMap[tokens[0]] || tokens[0] in keyMap)){
        const k = keyMap[tokens[0]];
        if (k === ' ') {
          body += `  Keyboard.print(' ');\n  delay(D_DELAY);\n`;
          lastAction = `  Keyboard.print(' ');\n  delay(D_DELAY);\n`;
        } else if (k === 'KEY_RETURN'){
          body += `  Keyboard.press(${k}); delay(${ENTER_DELAY}); Keyboard.release(${k});\n  delay(D_DELAY);\n`;
          lastAction = `  Keyboard.press(${k}); delay(${ENTER_DELAY}); Keyboard.release(${k});\n  delay(D_DELAY);\n`;
        } else {
          body += `  Keyboard.press(${k}); delay(5); Keyboard.release(${k});\n  delay(D_DELAY);\n`;
          lastAction = `  Keyboard.press(${k}); delay(5); Keyboard.release(${k});\n  delay(D_DELAY);\n`;
        }
        continue;
      }
      // Combo (CTRL ALT DELETE) or (GUI r)
      const isCombo = tokens.some(t => modMap[t]) || tokens.length>1;
      if (isCombo){
        body += pressCombo(tokens);
        lastAction = pressCombo(tokens);
        continue;
      }
      // Fallback: treat as STRING
      body += `  Keyboard.print("${escStr(raw)}");\n  delay(D_DELAY);\n`;
      lastAction = `  Keyboard.print("${escStr(raw)}");\n  delay(D_DELAY);\n`;
    }

    const header = `#include <Keyboard.h>\n\nint D_DELAY = ${DEFAULT_DELAY};\n\nvoid setup(){\n  delay(500);\n  Keyboard.begin();\n`;
    const footer = `  Keyboard.end();\n}\n\nvoid loop(){}\n`;
    return header + body + footer;
  }

  function convertNow(){
    out.value = toArduino(ducky.value);
  }

  // Wiring
  ducky.addEventListener('input', convertNow);
  el('defaultDelay').addEventListener('input', convertNow);
  el('enterDelay').addEventListener('input', convertNow);
  el('includeComments').addEventListener('change', convertNow);

  el('copy').addEventListener('click', () => {
    out.select(); document.execCommand('copy');
  });

  el('download').addEventListener('click', () => {
    convertNow();
    const blob = new Blob([out.value], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ducky_to_arduino.ino';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 0);
  });

  el('clear').addEventListener('click', () => { ducky.value=''; convertNow(); });

  el('file').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { ducky.value = reader.result; convertNow(); };
    reader.readAsText(f);
  });

  // Presets
  const presets = {
    run_notepad: `REM Buka Run\nGUI r\nDELAY 300\nSTRING notepad\nENTER\nDELAY 300\nSTRING Halo dari Arduino!\nENTER`,
    admin_cmd: `REM Buka CMD sebagai admin (Windows)\nGUI r\nDELAY 300\nSTRING powershell Start-Process cmd -Verb runAs\nENTER\nDELAY 800\nALT y\nDELAY 300\nSTRING whoami /all\nENTER`,
    type_text: `STRING Assalamu'alaikum, ini contoh pengetikan.\nENTER\nDELAY 300\nSTRING Selesai.`
  };
  document.querySelectorAll('.chip[data-demo]').forEach(ch => {
    ch.addEventListener('click', () => {
      const key = ch.getAttribute('data-demo');
      ducky.value = presets[key] || '';
      convertNow();
    });
  });

  // First run
  convertNow();
})();