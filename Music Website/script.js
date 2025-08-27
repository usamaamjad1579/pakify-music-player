// Small utility selectors
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// Elements
const navLinks = $$('.nav-link');
const sections = $$('.section');
const searchInput = $('#searchInput');
const songCards = $$('.song-card');
const heroNavButtons = $$('[data-nav-target]');
const playlistBannerCards = $$('.playlist-banner-card');

const audio = $('#audio');
const playerCover = $('#playerCover');
const playerTitle = $('#playerTitle');
const playerArtist = $('#playerArtist');
const playPauseBtn = $('#playPause');
const prevBtn = $('#prev');
const nextBtn = $('#next');
const progressEl = $('#progress');
const currentTimeEl = $('#currentTime');
const durationEl = $('#duration');
const volumeEl = $('#volume');
const shuffleBtn = $('#shuffle');
const repeatBtn = $('#repeat');

const createPlaylistModal = $('#createPlaylistModal');
const openCreateBtn = $('#open-create-playlist');
const closeCreateBtn = $('#closeCreate');
const createPlaylistBtn = $('#createPlaylistBtn');
const playlistNameInput = $('#playlistName');
const userPlaylistsList = $('#userPlaylists');

const themeToggle = $('#themeToggle');

// App state
let tracks = []; // objects {src,title,artist,cover,cardEl}
let currentIndex = -1;
let isShuffle = false;
let isRepeat = false;
let recentlyPlayed = [];
const recentlyPlayedLimit = 5;

// Initialize tracks from DOM
function initTracks() {
  tracks = songCards.map((card) => ({
    src: card.dataset.src,
    title: card.dataset.title || (card.querySelector('.title')?.textContent || 'Unknown'),
    artist: card.dataset.artist || (card.querySelector('.artist')?.textContent || 'Unknown'),
    cover: card.dataset.cover || (card.querySelector('img')?.src || 'assets/images/placeholder-cover.jpg'),
    el: card,
  }));
}

// Format time utility
function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  s = Math.floor(s);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// NAV: show/hide sections
function handleNavigation(target) {
  navLinks.forEach(n => n.classList.remove('active'));
  const activeNav = navLinks.find(n => n.dataset.target === target);
  if (activeNav) activeNav.classList.add('active');

  sections.forEach(s => s.id === target ? s.classList.add('active-section') : s.classList.remove('active-section'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(btn => {
  btn.addEventListener('click', () => handleNavigation(btn.dataset.target));
});

heroNavButtons.forEach(btn => {
  btn.addEventListener('click', () => handleNavigation(btn.dataset.navTarget));
});

playlistBannerCards.forEach(card => {
  card.addEventListener('click', () => {
    handleNavigation(card.dataset.navTarget);
  });
});

// Update Recently Played section
function updateRecentlyPlayed(track) {
  // Remove if already exists
  const existingIndex = recentlyPlayed.findIndex(t => t.src === track.src);
  if (existingIndex !== -1) {
    recentlyPlayed.splice(existingIndex, 1);
  }

  // Add to the front
  recentlyPlayed.unshift(track);

  // Trim to limit
  if (recentlyPlayed.length > recentlyPlayedLimit) {
    recentlyPlayed.pop();
  }

  renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
  const recentlyPlayedGrid = $('#recentlyPlayedGrid');
  if (!recentlyPlayedGrid) return;
  recentlyPlayedGrid.innerHTML = ''; // Clear previous content

  recentlyPlayed.forEach(track => {
    const card = document.createElement('article');
    card.classList.add('song-card');
    card.dataset.src = track.src;
    card.dataset.title = track.title;
    card.dataset.artist = track.artist;
    card.dataset.cover = track.cover;
    card.innerHTML = `
      <div class="cover"><img src="${track.cover}" alt=""></div>
      <div class="meta">
        <strong class="title">${track.title}</strong>
        <small class="artist">${track.artist}</small>
      </div>
      <button class="play-overlay" aria-label="Play">▶</button>
    `;
    recentlyPlayedGrid.appendChild(card);
    // Add event listener to the new card
    card.addEventListener('click', () => {
      const index = tracks.findIndex(t => t.src === track.src);
      if (index !== -1) {
        loadTrack(index, true);
      }
    });
  });
}

// Load a track
function loadTrack(index, autoplay = true) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const t = tracks[index];

  // Highlight active song card
  songCards.forEach(c => c.classList.remove('active-card'));
  t.el.classList.add('active-card');

  audio.src = t.src;
  playerCover.src = t.cover;
  playerTitle.textContent = t.title;
  playerArtist.textContent = t.artist;
  
  if (autoplay) {
    audio.play().catch(() => { /* some browsers block autoplay */ });
  }

  // Update recently played list
  updateRecentlyPlayed(t);
}

// Play/pause
function togglePlay() {
  if (currentIndex === -1 && tracks.length > 0) {
    loadTrack(0, true);
  } else if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}
playPauseBtn.addEventListener('click', togglePlay);

// Prev / Next
function nextTrack() {
  if (tracks.length === 0) return;
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentIndex = (currentIndex + 1) % tracks.length;
  }
  loadTrack(currentIndex, true);
}
function prevTrack() {
  if (tracks.length === 0) return;
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  }
  loadTrack(currentIndex, true);
}
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Shuffle / Repeat
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.opacity = isShuffle ? '1' : '0.6';
});
repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.style.opacity = isRepeat ? '1' : '0.6';
});

// Card click (play)
document.addEventListener('click', (e) => {
  const card = e.target.closest('.song-card');
  if (card) {
    const src = card.dataset.src;
    const index = tracks.findIndex(t => t.src === src);
    if (index !== -1) {
      loadTrack(index, true);
    }
  }
});

// Audio events
audio.addEventListener('play', () => playPauseBtn.textContent = '⏸');
audio.addEventListener('pause', () => playPauseBtn.textContent = '▶');
audio.addEventListener('timeupdate', () => {
  const cur = audio.currentTime;
  const dur = audio.duration;
  currentTimeEl.textContent = formatTime(cur);
  if (dur) progressEl.value = (cur / dur) * 100;
});
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextTrack();
  }
});

// progress control
progressEl.addEventListener('input', () => {
  if (!audio.duration) return;
  audio.currentTime = (progressEl.value / 100) * audio.duration;
});

// volume
volumeEl.addEventListener('input', () => audio.volume = volumeEl.value);

// search
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  songCards.forEach(card => {
    const title = (card.dataset.title || '').toLowerCase();
    const artist = (card.dataset.artist || '').toLowerCase();
    card.style.display = (!q || title.includes(q) || artist.includes(q)) ? '' : 'none';
  });
});

// Create playlist modal
openCreateBtn.addEventListener('click', () => createPlaylistModal.setAttribute('aria-hidden', 'false'));
closeCreateBtn.addEventListener('click', () => {
  createPlaylistModal.setAttribute('aria-hidden', 'true');
  playlistNameInput.value = '';
});
createPlaylistModal.addEventListener('click', (e) => {
  if (e.target === createPlaylistModal) createPlaylistModal.setAttribute('aria-hidden', 'true');
});

createPlaylistBtn.addEventListener('click', () => {
  const playlistName = playlistNameInput.value.trim();
  if (playlistName) {
    const newPlaylist = document.createElement('li');
    newPlaylist.textContent = playlistName;
    userPlaylistsList.appendChild(newPlaylist);
    createPlaylistModal.setAttribute('aria-hidden', 'true');
    playlistNameInput.value = '';
  }
});


// Keyboard: space toggles play/pause
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    togglePlay();
  }
});

// Theme toggle: light/dark persisted
const root = document.documentElement;
function applyTheme(name) {
  if (name === 'light') root.classList.add('light-theme');
  else root.classList.remove('light-theme');
  localStorage.setItem('pakify-theme', name);
}

const savedTheme = localStorage.getItem('pakify-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = root.classList.contains('light-theme') ? 'light' : 'dark';
  applyTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// Initial setup
initTracks();
if (tracks.length > 0) {
  loadTrack(0, false);
}