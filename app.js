const songs = [
  {title:'Midnight Costco',artist:'Kevin MacLeod — EDM Detection Mode',emoji:'🌃',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/EDM%20Detection%20Mode.mp3'},
  {title:'Left on Read Again',artist:'Kevin MacLeod — Cipher',emoji:'📱',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3'},
  {title:'Quarter Tank Energy',artist:'Kevin MacLeod — Mighty Like Us',emoji:'⛽',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Mighty%20Like%20Us.mp3'},
  {title:'One More Episode',artist:'Kevin MacLeod — The Lift',emoji:'📺',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/The%20Lift.mp3'},
  {title:'Parking Garage Level 4',artist:'Kevin MacLeod — 8bit Dungeon Level',emoji:'🅿️',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/8bit%20Dungeon%20Level.mp3'},
  {title:'Sunday Scaries (Extended Mix)',artist:'Kevin MacLeod — Spacial Harvest',emoji:'😵‍💫',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Spacial%20Harvest.mp3'},
  {title:'Air Fryer Beeping',artist:'Kevin MacLeod — Cloud Dancer',emoji:'🍟',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cloud%20Dancer.mp3'},
  {title:'I Definitely Need This',artist:'Kevin MacLeod — Equatorial Complex',emoji:'🛒',audio:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Equatorial%20Complex.mp3'}
];

const playlists = [
  ['Main Character Errands','For walking into Target like the finale.','🕶️'],
  ['Emotionally Available-ish','Soft songs, questionable communication.','💬'],
  ['Gym for 17 Minutes','Maximum confidence, minimum duration.','🏋️'],
  ['2AM Wikipedia Spiral','Songs for learning one useless fact too deeply.','🌀']
];

const audio = new Audio();
audio.preload = 'metadata';
let current = 0;
let playing = false;
let liked = new Set(JSON.parse(localStorage.getItem('likedSongs') || '[]'));

const $ = s => document.querySelector(s);
const playlistGrid = $('#playlistGrid');
const trackList = $('#trackList');
const likedList = $('#likedList');
const searchResults = $('#searchResults');

function saveLikes(){ localStorage.setItem('likedSongs', JSON.stringify([...liked])); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1600); }

function renderPlaylists(){
  playlistGrid.innerHTML = playlists.map((p,i)=>`<article class="playlist" data-play-index="${i}"><div class="playlist-art">${p[2]}</div><strong>${p[0]}</strong><span>${p[1]}</span></article>`).join('');
}

function trackHTML(song,i){
  return `<div class="track" data-index="${i}"><div class="track-art">${song.emoji}</div><div class="track-meta"><strong>${song.title}</strong><span>${song.artist}</span></div><button class="small-like ${liked.has(i)?'liked':''}" data-like="${i}">${liked.has(i)?'♥':'♡'}</button><button class="more">⋯</button></div>`;
}

function renderTracks(target=trackList, arr=songs){
  target.innerHTML = arr.map(item=>{ const i=songs.indexOf(item); return trackHTML(item,i); }).join('') || '<p style="color:#888;padding:18px">Nothing here yet.</p>';
}
function renderLiked(){ renderTracks(likedList, songs.filter((_,i)=>liked.has(i))); }

function updateMini(){
  const s=songs[current];
  $('#miniTitle').textContent=s.title; $('#miniArtist').textContent=s.artist; $('#miniArt').textContent=s.emoji;
  $('#miniPlay').textContent=playing?'❚❚':'▶';
  $('#miniLike').textContent=liked.has(current)?'♥':'♡'; $('#miniLike').classList.toggle('liked',liked.has(current));
}

async function playIndex(i){
  current=Number(i);
  const s=songs[current];
  if(audio.src !== s.audio) audio.src=s.audio;
  try {
    await audio.play();
    playing=true;
    updateMini();
    toast(`Now playing “${s.title}”`);
  } catch(err) {
    playing=false;
    updateMini();
    toast('Could not start audio. Tap play again.');
  }
}

async function togglePlayback(){
  if(!audio.src){ await playIndex(current); return; }
  if(audio.paused){
    try { await audio.play(); playing=true; } catch(err){ toast('Could not start audio.'); }
  } else { audio.pause(); playing=false; }
  updateMini();
}

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

$('#miniPlay').addEventListener('click',togglePlayback);
$('#miniLike').addEventListener('click',()=>toggleLike(current));
$('#profileBtn').addEventListener('click',()=>toast('Premium-ish member since 9:58 AM'));
$('#searchInput').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase().trim();
  renderTracks(searchResults, q ? songs.filter(s=>(s.title+' '+s.artist).toLowerCase().includes(q)) : songs);
});

audio.addEventListener('play',()=>{ playing=true; updateMini(); });
audio.addEventListener('pause',()=>{ playing=false; updateMini(); });
audio.addEventListener('ended',()=>playIndex((current+1)%songs.length));
audio.addEventListener('error',()=>{ playing=false; updateMini(); toast('This track could not be loaded.'); });

if('mediaSession' in navigator){
  audio.addEventListener('play',()=>{
    const s=songs[current];
    navigator.mediaSession.metadata=new MediaMetadata({title:s.title,artist:s.artist,album:'Spotify — Royalty-Free Mix'});
  });
  navigator.mediaSession.setActionHandler('play',()=>audio.play());
  navigator.mediaSession.setActionHandler('pause',()=>audio.pause());
  navigator.mediaSession.setActionHandler('nexttrack',()=>playIndex((current+1)%songs.length));
  navigator.mediaSession.setActionHandler('previoustrack',()=>playIndex((current-1+songs.length)%songs.length));
}

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js')); }
