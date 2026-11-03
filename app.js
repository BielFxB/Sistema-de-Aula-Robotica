/**
 * Robótica - Interactive Step-by-Step Slide Presentation Logic
 * Supports offline file:// and web server http:// modes
 */

(function () {
  'use strict';

  // State
  let allTutorials = [];
  let currentTutorial = null;
  let currentSlideIndex = 0;
  let zoomLevel = 1;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panCurrentX = 0;
  let panCurrentY = 0;

  const state = {
    activeCourse: 'all',
    activeSource: 'all', // 'all', 'mr', 'standard'
    searchQuery: '',
    sortBy: 'default'
  };

  // DOM Elements
  const catalogGrid = document.getElementById('catalog-grid');
  const emptyState = document.getElementById('empty-state');
  const resultsCount = document.getElementById('results-count');
  const activeFilterDesc = document.getElementById('active-filter-desc');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear');
  const sortSelect = document.getElementById('sort-select');
  const courseTabs = document.getElementById('course-tabs');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');

  // Counter Elements
  const countAll = document.getElementById('count-all');
  const countFirstbot = document.getElementById('count-firstbot');
  const countOnebot = document.getElementById('count-onebot');
  const countTechbot = document.getElementById('count-techbot');
  const countSkillbot = document.getElementById('count-skillbot');

  // Slide Dialog Elements
  const viewerDialog = document.getElementById('viewer-dialog');
  const slideProgressFill = document.getElementById('slide-progress-fill');
  const slideStepBadge = document.getElementById('slide-step-badge');
  const slideTitle = document.getElementById('slide-title');
  const viewerRobotName = document.getElementById('viewer-robot-name');
  const viewerCoursePill = document.getElementById('viewer-course-pill');
  const viewerLevelPill = document.getElementById('viewer-level-pill');
  const activeSlideImg = document.getElementById('active-slide-img');
  const slideImageCard = document.getElementById('slide-image-card');
  const btnPrevSlide = document.getElementById('btn-prev-slide');
  const btnNextSlide = document.getElementById('btn-next-slide');
  const slideFilmstrip = document.getElementById('slide-filmstrip');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Zoom Elements
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  const zoomLevelText = document.getElementById('zoom-level-text');

  // Initialize
  async function init() {
    initTheme();

    if (window.TUTORIALS_DATA && Array.isArray(window.TUTORIALS_DATA)) {
      allTutorials = window.TUTORIALS_DATA;
    } else {
      try {
        const response = await fetch('tutorials.json');
        allTutorials = await response.json();
      } catch (err) {
        console.error('Erro ao carregar tutoriais:', err);
      }
    }

    updateCounters();
    bindEvents();
    render();
  }

  // Theme Management (Dark / Light)
  function initTheme() {
    const savedTheme = localStorage.getItem('robotica-theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('robotica-theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // Update Counters in Navigation Tabs
  function updateCounters() {
    const total = allTutorials.length;
    const fbCount = allTutorials.filter(t => t.course === 'firstbot').length;
    const obCount = allTutorials.filter(t => t.course === 'onebot').length;
    const tbCount = allTutorials.filter(t => t.course === 'techbot').length;
    const skCount = allTutorials.filter(t => t.course === 'skillbot').length;

    countAll.textContent = total;
    countFirstbot.textContent = fbCount;
    countOnebot.textContent = obCount;
    countTechbot.textContent = tbCount;
    if (countSkillbot) countSkillbot.textContent = skCount;
  }

  // Event Listeners
  function bindEvents() {
    // Course Tab Switching
    courseTabs.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('button[role="tab"]');
      if (!tabBtn) return;
      const tabItem = tabBtn.closest('li.tab-item');
      if (!tabItem) return;

      const course = tabItem.getAttribute('data-course');
      setCourse(course);
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      searchClearBtn.hidden = !state.searchQuery;
      render();
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.hidden = true;
      searchInput.focus();
      render();
    });

    // Sort Select
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      render();
    });

    // Source / MR Filter Buttons
    document.querySelectorAll('.source-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const source = btn.getAttribute('data-source');
        setSourceFilter(source);
      });
    });

    // Theme Toggle
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', toggleTheme);
    }

    // Reset Filters
    btnResetFilters.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.hidden = true;
      setCourse('all');
      setSourceFilter('all');
      sortSelect.value = 'default';
      state.sortBy = 'default';
      render();
    });

    // Slide Controls
    btnPrevSlide.addEventListener('click', () => changeSlide(-1));
    btnNextSlide.addEventListener('click', () => changeSlide(1));

    // Fullscreen Toggle
    btnFullscreen.addEventListener('click', () => {
      toggleFullscreen();
    });

    // Native Fullscreen Event Listeners
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleNativeFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleNativeFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleNativeFullscreenChange);

    // Zoom Controls
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => setZoom(zoomLevel + 0.25));
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => setZoom(zoomLevel - 0.25));
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', () => resetZoom());
    }

    // Zoom via Mouse Wheel on slide frame
    const slideFrame = document.getElementById('slide-frame');
    if (slideFrame) {
      slideFrame.addEventListener('wheel', (e) => {
        if (!e.ctrlKey && !e.metaKey && e.deltaY === 0) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.2 : -0.2;
        setZoom(zoomLevel + delta);
      }, { passive: false });

      // Pan image by dragging when zoomed in
      slideFrame.addEventListener('mousedown', (e) => {
        if (zoomLevel <= 1) return;
        isPanning = true;
        panStartX = e.clientX - panCurrentX;
        panStartY = e.clientY - panCurrentY;
        slideFrame.classList.add('is-panning');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panCurrentX = e.clientX - panStartX;
        panCurrentY = e.clientY - panStartY;
        applyZoomTransform();
      });

      window.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          if (slideFrame) slideFrame.classList.remove('is-panning');
        }
      });
    }

    // Keyboard Shortcuts for Slide Presentation
    window.addEventListener('keydown', (e) => {
      if (!viewerDialog.open) return;

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        changeSlide(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End' && currentTutorial) {
        e.preventDefault();
        goToSlide(currentTutorial.slides.length - 1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(zoomLevel + 0.25);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(zoomLevel - 0.25);
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isCurrentlyFullscreen()) {
        e.preventDefault();
        toggleFullscreen(false);
      }
    });

    // Reset zoom and exit fullscreen on dialog close
    viewerDialog.addEventListener('close', () => {
      resetZoom();
      toggleFullscreen(false);
    });
  }

  // Set Active Course
  function setCourse(course) {
    state.activeCourse = course;
    document.body.setAttribute('data-active-course', course);

    // Update Tab UI
    document.querySelectorAll('.course-tabs li.tab-item').forEach(li => {
      const match = li.getAttribute('data-course') === course;
      li.classList.toggle('active', match);
      li.querySelector('button').setAttribute('aria-selected', match ? 'true' : 'false');
    });

    render();
  }

  // Set Source / MR Filter
  function setSourceFilter(source) {
    state.activeSource = source;
    document.querySelectorAll('.source-filter-btn').forEach(btn => {
      const match = btn.getAttribute('data-source') === source;
      btn.classList.toggle('active', match);
    });
    render();
  }

  // Filter and Sort Pipeline
  function getFilteredTutorials() {
    let list = [...allTutorials];

    // Filter by Course
    if (state.activeCourse !== 'all') {
      list = list.filter(t => t.course === state.activeCourse);
    }

    // Filter by Source (MR vs Standard)
    if (state.activeSource === 'mr') {
      list = list.filter(t => t.sourceType === 'mr');
    } else if (state.activeSource === 'standard') {
      list = list.filter(t => t.sourceType !== 'mr');
    }

    // Filter by Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(t => {
        return t.title.toLowerCase().includes(q) ||
               t.originalTitle.toLowerCase().includes(q) ||
               t.courseName.toLowerCase().includes(q) ||
               t.level.toLowerCase().includes(q);
      });
    }

    // Sort
    if (state.sortBy === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    } else if (state.sortBy === 'steps-desc') {
      list.sort((a, b) => (b.slideCount || b.steps) - (a.slideCount || a.steps));
    } else if (state.sortBy === 'steps-asc') {
      list.sort((a, b) => (a.slideCount || a.steps) - (b.slideCount || b.steps));
    }

    return list;
  }

  // Render Catalog Grid
  function render() {
    const list = getFilteredTutorials();

    // Results feedback
    resultsCount.textContent = `Exibindo ${list.length} ${list.length === 1 ? 'projeto' : 'projetos'}`;
    
    let filterDetails = [];
    if (state.activeCourse !== 'all') {
      const cNames = { firstbot: 'FirstBot', onebot: 'OneBot', techbot: 'TechBot', skillbot: 'SkillBot' };
      filterDetails.push(`Curso: ${cNames[state.activeCourse]}`);
    }
    if (state.activeSource === 'mr') {
      filterDetails.push('Filtro: Aulas MR');
    } else if (state.activeSource === 'standard') {
      filterDetails.push('Filtro: Aulas Padrão');
    }
    if (state.searchQuery) {
      filterDetails.push(`Busca: "${state.searchQuery}"`);
    }
    activeFilterDesc.textContent = filterDetails.length ? `(${filterDetails.join(' · ')})` : '';

    if (list.length === 0) {
      catalogGrid.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    // Render cards
    catalogGrid.innerHTML = list.map((item, index) => {
      const courseClass = `course-${item.course}`;
      const isPriority = index < 6;
      const slideTotal = item.slideCount || (item.slides ? item.slides.length : item.steps);
      const isMr = item.sourceType === 'mr';

      return `
        <article class="robot-card ${courseClass} ${isMr ? 'card-is-mr' : ''}" data-id="${item.id}" style="--card-accent: var(--color-${item.course}); --card-accent-subtle: var(--color-${item.course}-subtle)">
          <div class="card-header">
            <span class="card-num-badge">#${escapeHtml(item.id.toUpperCase())}</span>
            <div class="card-tags-header">
              ${isMr ? '<span class="mr-pill-badge" title="Material complementar My Robot">MR</span>' : ''}
              <span class="card-level-tag">${escapeHtml(item.level)}</span>
            </div>
          </div>

          <div class="card-image-wrap btn-open-slides" data-id="${item.id}" title="Clique para abrir os slides de montagem">
            <img 
              src="${item.thumb}" 
              alt="${escapeHtml(item.title)}" 
              width="360" 
              height="270" 
              loading="${isPriority ? 'eager' : 'lazy'}" 
              ${isPriority ? 'fetchpriority="high"' : ''}
            >
          </div>

          <div class="card-content">
            <div class="card-course-indicator">
              <span class="course-dot dot-${item.course}" aria-hidden="true"></span>
              <span>${escapeHtml(item.courseName)}</span>
            </div>

            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-orig-title">${escapeHtml(item.originalTitle)}</p>

            <div class="card-specs">
              <span class="spec-item" title="Número de slides de montagem passo a passo">
                <svg class="spec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                ${slideTotal} slides
              </span>
              <span class="spec-item" title="Páginas do manual formatado em PDF">
                <svg class="spec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                ${item.pageCount} págs
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button type="button" class="btn btn-primary btn-open-slides" data-id="${item.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Apresentar Slides</span>
            </button>
            <a href="${item.pdf}" download class="btn btn-secondary btn-icon" title="Baixar PDF do manual">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span class="visually-hidden">Baixar PDF</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Attach card click handlers
    catalogGrid.querySelectorAll('.btn-open-slides').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-id');
        openSlidePresentation(id);
      });
    });
  }

  // Open Interactive Slide Presentation
  function openSlidePresentation(tutorialId) {
    const item = allTutorials.find(t => t.id === tutorialId);
    if (!item || !item.slides || !item.slides.length) return;

    currentTutorial = item;
    currentSlideIndex = 0;
    resetZoom();

    // Header info
    viewerRobotName.textContent = `${item.title} (${item.originalTitle})`;
    viewerCoursePill.textContent = item.courseName;
    viewerCoursePill.className = `dialog-course-pill dot-${item.course}`;
    viewerLevelPill.textContent = item.level;

    // Render Bottom Filmstrip Step Tiles
    slideFilmstrip.innerHTML = item.slides.map((s, idx) => {
      let shortLabel = `${idx + 1}`;
      if (s.type === 'overview') shortLabel = 'Peças';
      else if (s.type === 'finish') shortLabel = 'OK';
      else if (s.type === 'wiring') shortLabel = 'Placa';
      else if (s.label.startsWith('Passo ')) shortLabel = s.label.replace('Passo ', '');

      return `
        <button type="button" class="step-tile ${idx === 0 ? 'active' : ''}" data-index="${idx}" title="${escapeHtml(s.label)}">
          <span class="step-tile-num">${shortLabel}</span>
        </button>
      `;
    }).join('');

    slideFilmstrip.querySelectorAll('.step-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const idx = parseInt(tile.getAttribute('data-index'), 10);
        goToSlide(idx);
      });
    });

    // Display first slide
    updateSlideDisplay();

    // Show modal dialog
    viewerDialog.showModal();
  }

  // Fullscreen management (combines CSS maximize and HTML5 Fullscreen API)
  function isCurrentlyFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      viewerDialog.classList.contains('is-fullscreen')
    );
  }

  function updateFullscreenUI(active) {
    const span = btnFullscreen.querySelector('.fs-label') || btnFullscreen.querySelector('span');
    if (span) {
      span.textContent = active ? 'Sair da Tela Cheia' : 'Tela Cheia';
    }
    btnFullscreen.classList.toggle('active', active);
    btnFullscreen.setAttribute('title', active ? 'Sair da tela cheia (Esc ou F)' : 'Apresentar em tela cheia (F ou F11)');
  }

  function toggleFullscreen(forceState) {
    const current = isCurrentlyFullscreen();
    const shouldBeFs = typeof forceState === 'boolean' ? forceState : !current;

    if (shouldBeFs) {
      // 1. Immediately apply CSS maximize mode (reliable across 100% of devices and browsers)
      viewerDialog.classList.add('is-fullscreen');
      document.body.classList.add('viewer-is-fullscreen');
      updateFullscreenUI(true);

      // 2. Request native Fullscreen API on dialog or documentElement
      const req = (
        viewerDialog.requestFullscreen ||
        viewerDialog.webkitRequestFullscreen ||
        viewerDialog.mozRequestFullScreen ||
        viewerDialog.msRequestFullscreen ||
        document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.msRequestFullscreen
      );

      if (req) {
        try {
          const promise = req.call(viewerDialog);
          if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {
              try {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              } catch (_) {}
            });
          }
        } catch (_) {
          try {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            }
          } catch (_) {}
        }
      }
    } else {
      // 1. Remove CSS maximize mode
      viewerDialog.classList.remove('is-fullscreen');
      document.body.classList.remove('viewer-is-fullscreen');
      updateFullscreenUI(false);

      // 2. Exit native fullscreen if active
      const hasNativeFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (hasNativeFs) {
        const exit = (
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen
        );
        if (exit) {
          try {
            const promise = exit.call(document);
            if (promise && typeof promise.catch === 'function') {
              promise.catch(() => {});
            }
          } catch (_) {}
        }
      }
    }
  }

  function handleNativeFullscreenChange() {
    const hasNativeFs = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (hasNativeFs) {
      viewerDialog.classList.add('is-fullscreen');
      document.body.classList.add('viewer-is-fullscreen');
      updateFullscreenUI(true);
    } else if (!viewerDialog.classList.contains('is-fullscreen')) {
      updateFullscreenUI(false);
    }
  }

  // Zoom management
  function setZoom(level) {
    // Clamp zoom between 100% (1.0) and 300% (3.0)
    zoomLevel = Math.max(1, Math.min(3, Math.round(level * 100) / 100));
    if (zoomLevel === 1) {
      panCurrentX = 0;
      panCurrentY = 0;
    }
    applyZoomTransform();
  }

  function resetZoom() {
    zoomLevel = 1;
    panCurrentX = 0;
    panCurrentY = 0;
    applyZoomTransform();
  }

  function applyZoomTransform() {
    if (zoomLevelText) {
      zoomLevelText.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
    if (activeSlideImg) {
      activeSlideImg.style.transform = `scale(${zoomLevel}) translate(${panCurrentX / zoomLevel}px, ${panCurrentY / zoomLevel}px)`;
      activeSlideImg.style.cursor = zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default';
    }
    if (btnZoomOut) {
      btnZoomOut.disabled = zoomLevel <= 1;
    }
    if (btnZoomIn) {
      btnZoomIn.disabled = zoomLevel >= 3;
    }
  }

  // Update Center Slide Display
  function updateSlideDisplay() {
    if (!currentTutorial || !currentTutorial.slides.length) return;

    resetZoom();

    const total = currentTutorial.slides.length;
    const currentSlide = currentTutorial.slides[currentSlideIndex];

    // Badge and labels
    slideStepBadge.textContent = `Slide ${currentSlideIndex + 1} de ${total}`;
    slideTitle.textContent = currentSlide.label;

    // Progress bar fill percentage
    const progressPct = Math.round(((currentSlideIndex + 1) / total) * 100);
    slideProgressFill.style.width = `${progressPct}%`;

    // Active slide image
    activeSlideImg.src = currentSlide.src;
    activeSlideImg.alt = `${currentTutorial.title} - ${currentSlide.label}`;

    // Nav buttons disabled state
    btnPrevSlide.disabled = currentSlideIndex === 0;
    btnNextSlide.disabled = currentSlideIndex === total - 1;

    // Update active tile in bottom filmstrip
    slideFilmstrip.querySelectorAll('.step-tile').forEach((tile, idx) => {
      tile.classList.toggle('active', idx === currentSlideIndex);
      if (idx === currentSlideIndex) {
        tile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function changeSlide(delta) {
    if (!currentTutorial) return;
    const newIdx = currentSlideIndex + delta;
    if (newIdx >= 0 && newIdx < currentTutorial.slides.length) {
      currentSlideIndex = newIdx;
      updateSlideDisplay();
    }
  }

  function goToSlide(index) {
    if (!currentTutorial) return;
    if (index >= 0 && index < currentTutorial.slides.length) {
      currentSlideIndex = index;
      updateSlideDisplay();
    }
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
