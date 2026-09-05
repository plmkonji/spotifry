const songs = [
  {title:'Midnight Costco',artist:'The Receipt Inspectors',emoji:'🌃'},
  {title:'Left on Read Again',artist:'Typing…',emoji:'📱'},
  {title:'Quarter Tank Energy',artist:'Low Fuel',emoji:'⛽'},
  {title:'One More Episode',artist:'Sleep Debt',emoji:'📺'},
  {title:'Parking Garage Level 4',artist:'Where Is My Car?',emoji:'🅿️'},
  {title:'Sunday Scaries (Extended Mix)',artist:'Monday Morning',emoji:'😵‍💫'},
  {title:'Air Fryer Beeping',artist:'Kitchen DJ',emoji:'🍟'},
  {title:'I Definitely Need This',artist:'Impulse Purchase',emoji:'🛒'}
];

const playlists = [
  ['Main Character Errands','For walking into Target like the finale.','🕶️'],
  ['Emotionally Available-ish','Soft songs, questionable communication.','💬'],
  ['Gym for 17 Minutes','Maximum confidence, minimum duration.','🏋️'],
  ['2AM Wikipedia Spiral','Songs for learning one useless fact too deeply.','🌀']
];

let current = 0;
let playing = false;
let liked = new Set(JSON.parse(localStorage.getItem('likedSongs') || '[]'));

const $ = s => document.querySelector(s);
const playlistGrid = $('#playlistGrid');
const trackList = $('#trackList');
const likedList = $('#likedList');
const searchResults = $('#searchResults');

function saveLikes(){ localStorage.setItem('likedSongs', JSON.stringify([...liked])); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1200); }

function renderPlaylists(){
  playlistGrid.innerHTML = playlists.map((p,i)=>`<article class="playlist" data-play-index="${i}"><div class="playlist-art">${p[2]}</div><strong>${p[0]}</strong><span>${p[1]}</span></article>`).join('');
}

function trackHTML(song,i){
  return `<div class="track" data-index="${i}"><div class="track-art">${song.emoji}</div><div class="track-meta"><strong>${song.title}</strong><span>${song.artist}</span></div><button class="small-like ${liked.has(i)?'liked':''}" data-like="${i}">${liked.has(i)?'♥':'♡'}</button><button class="more">⋯</button></div>`;
}

function renderTracks(target=trackList, arr=songs){
  target.innerHTML = arr.map(item=>{
    const i=songs.indexOf(item); return trackHTML(item,i);
  }).join('') || '<p style="color:#888;padding:18px">Nothing here yet.</p>';
}
function renderLiked(){ renderTracks(likedList, songs.filter((_,i)=>liked.has(i))); }

function updateMini(){
  const s=songs[current];
  $('#miniTitle').textContent=s.title; $('#miniArtist').textContent=s.artist; $('#miniArt').textContent=s.emoji;
  $('#miniPlay').textContent=playing?'❚❚':'▶';
  $('#miniLike').textContent=liked.has(current)?'♥':'♡'; $('#miniLike').classList.toggle('liked',liked.has(current));
}
function playIndex(i){ current=Number(i); playing=true; updateMini(); toast(`Now pretending to play “${songs[current].title}”`); }
function toggleLike(i){ i=Number(i); liked.has(i)?liked.delete(i):liked.add(i); saveLikes(); renderTracks(); renderLiked(); updateMini(); }

renderPlaylists(); renderTracks(); renderLiked(); updateMini();

document.addEventListener('click',e=>{
  const p=e.target.closest('[data-play-index]'); if(p){ playIndex(p.dataset.playIndex); return; }
  const like=e.target.closest('[data-like]'); if(like){ e.stopPropagation(); toggleLike(like.dataset.like); return; }
  const track=e.target.closest('.track'); if(track){ playIndex(track.dataset.index); return; }
  const nav=e.target.closest('.nav-btn'); if(nav){
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); nav.classList.add('active');
    const tab=nav.dataset.tab;
    $('#searchSection').classList.toggle('hidden',tab!=='search');
    $('#librarySection').classList.toggle('hidden',tab!=='library');
    document.querySelectorAll('main > section:not(#searchSection):not(#librarySection)').forEach(s=>s.classList.toggle('hidden',tab!=='home'));
    if(tab==='search') setTimeout(()=>$('#searchInput').focus(),50);
  }
});

$('#miniPlay').addEventListener('click',()=>{ playing=!playing; updateMini(); });
$('#miniLike').addEventListener('click',()=>toggleLike(current));
$('#profileBtn').addEventListener('click',()=>toast('Premium-ish member since 9:58 AM'));
$('#searchInput').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase().trim();
  renderTracks(searchResults, q ? songs.filter(s=>(s.title+' '+s.artist).toLowerCase().includes(q)) : songs);
});

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js')); }
