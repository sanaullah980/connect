function notifications(){return `<div class="page-head"><div><h2>Notifications</h2><p class="muted">Updates relevant to your academic scope.</p></div><button class="btn" id="read-all">Mark all read</button></div><div class="card">${state.notifications.map(n=>`<div class="item"><div class="avatar">🔔</div><div style="flex:1"><strong>${n.text}</strong><div class="muted">${n.read?'Read':'Unread'}</div></div>${!n.read?'<span class="tag">New</span>':''}</div>`).join('')}</div>`}function bindNotifications(){(document.getElementById('read-all')||{}).onclick=()=>{state.notifications.forEach(n=>n.read=true);document.dispatchEvent(new Event('render'))}}

window.notifications=notifications;
window.bindNotifications=bindNotifications;
