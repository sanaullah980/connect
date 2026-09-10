(function(){
const pages={dashboard,timetable,notices,materials,groups,lostfound,profile,subjects,notifications,roles,settings};
const bind={timetable:bindTimetable,notices:bindNotices,materials:bindMaterials,groups:bindGroups,lostfound:bindLostFound,profile:bindProfile,notifications:bindNotifications,roles:bindRoles,settings:bindSettings};
function render(){
 document.documentElement.classList.toggle('dark',state.dark);
 const app=document.getElementById('app'); if(!app) return;
 app.innerHTML=`<div class="app"><aside class="sidebar"><div class="brand"><div class="brand-badge">CC</div><span>Connect Campus</span></div><div class="brand-sub">Your campus, connected</div><nav class="nav">${nav.map(n=>`<button class="${state.page===n[0]?'active':''}" data-page="${n[0]}"><span>${n[1]}</span><span>${n[2]}</span></button>`).join('')}</nav></aside><main class="main"><header class="topbar"><div><h1>${nav.find(n=>n[0]===state.page)?.[2]||'Connect Campus'}</h1><div class="muted">One campus. Connected.</div></div><div class="actions"><button class="icon-btn" data-page="notifications">🔔 <b>${state.notifications.filter(n=>!n.read).length}</b></button><button class="icon-btn" data-page="settings">⚙️</button></div></header><section class="content">${pages[state.page] ? pages[state.page]() : dashboard()}</section></main><nav class="bottom-nav">${nav.slice(0,6).map(n=>`<button class="${state.page===n[0]?'active':''}" data-page="${n[0]}"><span>${n[1]}</span><small>${n[2].replace('Lost & Found','Lost')}</small></button>`).join('')}</nav></div>`;
 document.querySelectorAll('[data-page],[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.page||b.dataset.go));
 if(bind[state.page]) bind[state.page]();
}
window.render=render;
window.navigate=function(p){state.page=p; render(); window.scrollTo({top:0,behavior:'smooth'});};
render();
})();
