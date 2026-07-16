import './style.css';
import { RippleEngine } from './ripple.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Ripple Canvas Initialization ---
  const canvas = document.getElementById('ripple-canvas');
  const engine = new RippleEngine(canvas);
  engine.tick();



  // Mouse trail support
  window.addEventListener('mousemove', (e) => {
    // Only capture moves if not on top of heavy interactive blocks
    const target = e.target;
    if (target.closest('.glass') || target.closest('header') || target.closest('form')) {
      engine.setMouse(e.clientX, e.clientY, false);
    } else {
      engine.setMouse(e.clientX, e.clientY, true);
    }
  });

  window.addEventListener('mouseleave', () => {
    engine.setMouse(-1000, -1000, false);
  });

  // Tap anywhere for ripples
  window.addEventListener('click', (e) => {
    // Prevent triggering ripples when clicking buttons, inputs, links
    const target = e.target;
    if (
      target.tagName === 'BUTTON' || 
      target.tagName === 'INPUT' || 
      target.tagName === 'SELECT' || 
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }
    
    // Create big ripple at click coordinate
    engine.createRipple(e.clientX, e.clientY, true);
  });


  // --- 2. Floating Navbar Scroll Effect ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    highlightNavOnScroll();
  });


  // --- 3. Navbar Navigation Highlights ---
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  function highlightNavOnScroll() {
    let scrollPos = window.scrollY + 120; // offset header
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }


  // --- 4. Oracle / Divination Logic ---
  const oracleInput = document.getElementById('oracle-input');
  const oracleSubmitBtn = document.getElementById('oracle-submit-btn');
  const oracleResult = document.getElementById('oracle-result');
  const oracleIndicator = document.querySelector('.oracle-ripple-indicator');
  
  const resultCategory = document.getElementById('result-category');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const resultDuration = document.getElementById('result-duration');
  const resultLevel = document.getElementById('result-level');
  const startSessionBtn = document.getElementById('start-session-btn');

  // Divination response database
  const responses = {
    stressed: {
      category: "Breathwork",
      title: "Nadi Shodhana (Alternate Nostril Breath)",
      desc: "Guided by Veda Shreedhar. A highly balancing pranayama technique designed to calm the parasympathetic nervous system, release anxiety, and sync brain hemispheres.",
      duration: "10 mins",
      level: "All Levels",
      trackIndex: 0
    },
    stiff: {
      category: "Yoga Flow",
      title: "Somatic Joint Release Flow",
      desc: "Led by Veda Shreedhar. Slow, continuous movements targeting hip flexors, hamstrings, and thoracic spine stiffness to restore skeletal alignment utilizing classical props.",
      duration: "30 mins",
      level: "Beginner",
      trackIndex: 2
    },
    tired: {
      category: "Restorative",
      title: "Prana Awakening Restorative",
      desc: "Led by Veda Shreedhar. Deep, fully-supported chest opener postures combined with long holds and bolsters to refill energy reserves without physical strain.",
      duration: "25 mins",
      level: "Beginner",
      trackIndex: 1
    },
    restless: {
      category: "Meditation",
      title: "Solar Plexus Grounding Meditation",
      desc: "Guided by Veda Shreedhar. Focused visualization centering attention on the core area, utilizing crystal bowl sound frequencies to absorb restless active energy.",
      duration: "15 mins",
      level: "Intermediate",
      trackIndex: 1
    },
    default: {
      category: "Yoga Flow",
      title: "Etheric Alignment Flow",
      desc: "Led by Veda Shreedhar. A complete structural alignment flow. Balances spinal rotations, standing stability, lunges, and mindful posture checking.",
      duration: "20 mins",
      level: "Intermediate",
      trackIndex: 0
    }
  };

  function handleDivination() {
    const text = oracleInput.value.toLowerCase().trim();
    let selectedResponse = responses.default;
    
    // Choose response based on simple keyword parsing
    if (text.includes('stress') || text.includes('anxious') || text.includes('calm') || text.includes('worry')) {
      selectedResponse = responses.stressed;
    } else if (text.includes('stiff') || text.includes('tight') || text.includes('pain') || text.includes('body')) {
      selectedResponse = responses.stiff;
    } else if (text.includes('tired') || text.includes('exhausted') || text.includes('sleep') || text.includes('low')) {
      selectedResponse = responses.tired;
    } else if (text.includes('restless') || text.includes('mind') || text.includes('focus') || text.includes('busy')) {
      selectedResponse = responses.restless;
    }

    // Trigger visual ripple burst
    const rect = oracleIndicator.getBoundingClientRect();
    const rippleX = rect.left + rect.width / 2;
    const rippleY = rect.top + rect.height / 2;
    
    // Generate massive wave ripple centered at the indicator
    engine.createRipple(rippleX, rippleY, true);
    setTimeout(() => {
      engine.createRipple(rippleX + 50, rippleY - 30, true);
    }, 200);
    setTimeout(() => {
      engine.createRipple(rippleX - 50, rippleY + 30, true);
    }, 400);

    // Animation states
    oracleSubmitBtn.disabled = true;
    oracleSubmitBtn.querySelector('.btn-text').innerText = "Divining...";
    oracleIndicator.style.boxShadow = "0 0 40px rgba(230, 194, 128, 0.4)";
    oracleIndicator.style.borderColor = "var(--accent-gold)";
    
    // Hide previous result if visible
    oracleResult.classList.add('hidden');

    setTimeout(() => {
      // Show customized Oracle outcome
      resultCategory.innerText = selectedResponse.category;
      resultTitle.innerText = selectedResponse.title;
      resultDesc.innerText = selectedResponse.desc;
      resultDuration.innerText = selectedResponse.duration;
      resultLevel.innerText = selectedResponse.level;
      
      // Store reference to selected track index on the start button
      startSessionBtn.setAttribute('data-track-index', selectedResponse.trackIndex);
      
      oracleResult.classList.remove('hidden');
      
      // Scroll smoothly down a bit to show result card
      oracleResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Reset button states
      oracleSubmitBtn.disabled = false;
      oracleSubmitBtn.querySelector('.btn-text').innerText = "Cast Seed";
      oracleIndicator.style.boxShadow = "none";
      oracleIndicator.style.borderColor = "rgba(255, 255, 255, 0.05)";
    }, 1500);
  }

  oracleSubmitBtn.addEventListener('click', handleDivination);
  oracleIndicator.addEventListener('click', handleDivination);
  oracleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleDivination();
  });


  // --- 5. Guided Meditation Audio Player ---
  const audio = new Audio();
  
  const tracks = [
    {
      title: "Etheric Breath Release",
      artist: "Guided Pranayama & Solfeggio 528Hz",
      duration: "12:30",
      seconds: 750,
      url: "https://assets.mixkit.co/music/preview/mixkit-zen-yoga-meditation-music-1501.mp3"
    },
    {
      title: "Tibetan Sound Journey",
      artist: "Crystal Bowls & Binaural Beats 432Hz",
      duration: "15:45",
      seconds: 945,
      url: "https://assets.mixkit.co/music/preview/mixkit-meditation-soft-bells-1502.mp3"
    },
    {
      title: "Solar Vinyasa Rhythm",
      artist: "Ambient Uplift & Rhythmic Breathing",
      duration: "20:00",
      seconds: 1200,
      url: "https://assets.mixkit.co/music/preview/mixkit-forest-monsoon-993.mp3"
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let playerInterval = null;
  let visualizerInterval = null;

  const playBtn = document.getElementById('player-play-btn');
  const prevBtn = document.getElementById('player-prev');
  const nextBtn = document.getElementById('player-next');
  const trackTitle = document.getElementById('player-track-title');
  const trackDesc = document.getElementById('player-track-desc');
  const currentTimeLabel = document.getElementById('player-current-time');
  const totalTimeLabel = document.getElementById('player-total-time');
  const progressFill = document.getElementById('player-progress-fill');
  const progressBar = document.getElementById('player-progress-bar');
  const playerDisc = document.querySelector('.player-disc');
  const visualizerBars = document.querySelectorAll('.sound-wave-visualizer .bar');

  // Track natural ending
  audio.addEventListener('ended', () => {
    nextTrack();
  });

  // Load track info
  function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    trackTitle.innerText = track.title;
    trackDesc.innerText = track.artist;
    totalTimeLabel.innerText = track.duration;
    
    // Set actual stream source
    audio.src = track.url;
    audio.load();
    
    currentTimeLabel.innerText = "0:00";
    progressFill.style.width = "0%";
  }

  function startPlayback() {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    playerDisc.style.animationPlayState = 'running';
    
    audio.play().catch(err => {
      console.log("Audio play blocked by browser sandbox / autoplay rules: ", err);
    });
    
    // Clear previous loops
    clearInterval(playerInterval);
    clearInterval(visualizerInterval);

    // Audio progress update loop
    playerInterval = setInterval(() => {
      if (audio.duration) {
        const currentPlaySeconds = Math.floor(audio.currentTime);
        const mins = Math.floor(currentPlaySeconds / 60);
        const secs = currentPlaySeconds % 60;
        currentTimeLabel.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
      }
    }, 250);

    // Soundwave visualizer bars animation loop
    visualizerInterval = setInterval(() => {
      visualizerBars.forEach(bar => {
        const randomHeight = Math.floor(Math.random() * 32) + 6;
        bar.style.height = `${randomHeight}px`;
      });
    }, 100);
  }

  function pausePlayback() {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    playerDisc.style.animationPlayState = 'paused';
    
    audio.pause();
    
    clearInterval(playerInterval);
    clearInterval(visualizerInterval);
    
    // Flatten visualizer bars
    visualizerBars.forEach(bar => {
      bar.style.height = '4px';
    });
  }

  function togglePlay() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
      startPlayback();
    }
  }

  function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
      startPlayback();
    }
  }

  // Progress scrubbing
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    if (audio.duration) {
      audio.currentTime = audio.duration * percentage;
      progressFill.style.width = `${percentage * 100}%`;
      if (!isPlaying) {
        startPlayback();
      }
    }
  });

  // Action listeners
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);

  // Link "Start Practice" inside the Oracle results to the Player
  startSessionBtn.addEventListener('click', () => {
    const trackIdx = parseInt(startSessionBtn.getAttribute('data-track-index')) || 0;
    
    // Load matching track and scroll to player section
    loadTrack(trackIdx);
    startPlayback();
    
    document.getElementById('meditation').scrollIntoView({ behavior: 'smooth' });
  });

  // Initialize first track data without autoplaying
  loadTrack(0);


  // --- 6. Booking Form Submission Mock ---
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccess = document.getElementById('booking-success');
  const bookingResetBtn = document.getElementById('booking-reset-btn');

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Animate submit
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = "Reserving...";
    
    // Simulate API registration call
    setTimeout(() => {
      bookingForm.classList.add('hidden');
      bookingSuccess.classList.remove('hidden');
      
      // Trigger gold ripple animation around booking section
      const rect = bookingSuccess.getBoundingClientRect();
      const rippleX = rect.left + rect.width / 2;
      const rippleY = rect.top + rect.height / 2;
      engine.createRipple(rippleX, rippleY, true);
    }, 1200);
  });

  bookingResetBtn.addEventListener('click', () => {
    bookingSuccess.classList.add('hidden');
    bookingForm.classList.remove('hidden');
    bookingForm.reset();
    
    // Reset booking submit button
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerText = "Reserve Mat";
  });
});
