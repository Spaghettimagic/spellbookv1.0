const containerId = 'toast-container';
function getContainer() {
  let c = document.getElementById(containerId);
  if (!c) {
    c = document.createElement('div');
    c.id = containerId;
    Object.assign(c.style,{
      position:'fixed', right:'16px', bottom:'16px',
      display:'flex', flexDirection:'column', gap:'8px', zIndex:'2147483647'
    });
    document.body.appendChild(c);
  }
  return c;
}
export function showToast(msg,{type='info',duration=4000,action}={}) {
  const c = getContainer();
  const el = document.createElement('div');
  el.role = 'status';
  el.className = 'toast';
  Object.assign(el.style,{
    padding:'12px 14px', borderRadius:'10px',
    background:'var(--surface-2,#222)', color:'var(--fg,#fff)',
    boxShadow:'0 2px 10px rgba(0,0,0,.2)', display:'flex', alignItems:'center', gap:'10px'
  });
  el.innerHTML = `<span>${msg}</span>`;
  if (action?.text && typeof action?.callback === 'function') {
    const btn = document.createElement('button');
    btn.textContent = action.text;
    btn.onclick = () => { try { action.callback(); } finally { el.remove(); } };
    el.appendChild(btn);
  }
  c.appendChild(el);
  setTimeout(()=> el.remove(), duration);
}
export function initNotificationSystem(){ getContainer(); }
