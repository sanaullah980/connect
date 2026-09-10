const nav=[['dashboard','🏠','Dashboard'],['timetable','🗓️','Timetable'],['notices','📢','Notices'],['materials','📚','Materials'],['groups','💬','Groups'],['lostfound','🔎','Lost & Found'],['subjects','🎓','My Subjects'],['profile','👤','Academic Profile'],['notifications','🔔','Notifications'],['roles','🛡️','Roles'],['settings','⚙️','Settings']];
function navigate(p){state.page=p;document.dispatchEvent(new Event('render'))}

window.nav=nav; window.navigate=navigate;
