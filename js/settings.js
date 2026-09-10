function settings(){return `<div class="page-head"><div><h2>Settings</h2><p class="muted">Appearance and notification preferences.</p></div></div><div class="card"><div class="item"><div style="flex:1"><strong>Dark mode</strong><div class="muted">Switch the campus interface theme.</div></div><button id="theme" class="btn">${state.dark?'Use light':'Use dark'}</button></div><div class="item"><div><strong>Notification preferences</strong><div class="muted">Announcements, timetable and group updates</div></div></div></div>`}function bindSettings(){(document.getElementById('theme')||{}).onclick=()=>{state.dark=!state.dark;document.documentElement.classList.toggle('dark',state.dark);document.dispatchEvent(new Event('render'))}}

window.settings=settings;
window.bindSettings=bindSettings;
