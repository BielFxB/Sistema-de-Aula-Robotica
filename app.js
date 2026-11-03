/**
 * Bancada de Robótica - Interactive Step-by-Step Slide Presentation Logic
 * Supports offline file:// and web server http:// modes
 */

(function () {
  'use strict';

  // State
  let allTutorials = [];
  let currentTutorial = null;
  let currentSlideIndex = 0;

  const state = {
    activeCourse: 'all',
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

  // Counter Elements
  const countAll = document.getElementById('count-all');
  const countFirstbot = document.getElementById('count-firstbot');
  const countOnebot = document.getElementById('count-onebot');
  const countTechbot = document.getElementById('count-techbot');

  // Slide Dialog Elements
  const viewerDialog = document.getElementById('viewer-dialog');
  const slideProgressFill = document.getElementById('slide-progress-fill');
  const slideStepBadge = document.getElementById('slide-step-badge');
  const slideTitle = document.getElementById('slide-title');
  const viewerRobotName = document.getElementById('viewer-robot-name');
  const viewerCoursePill = document.getElementById('viewer-course-pill');
  const viewerLevelPill = document.getElementById('viewer-level-pill');
  const viewerDownloadBtn = document.getElementById('viewer-download-btn');
  const activeSlideImg = document.getElementById('active-slide-img');
  const btnPrevSlide = document.getElementById('btn-prev-slide');
  const btnNextSlide = document.getElementById('btn-next-slide');
  const slideFilmstrip = document.getElementById('slide-filmstrip');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnModeSlides = document.getElementById('btn-mode-slides');
  const btnModePdf = document.getElementById('btn-mode-pdf');
  const slidesViewportWrap = document.getElementById('slides-viewport-wrap');
  const pdfFallbackView = document.getElementById('pdf-fallback-view');
  const viewerPdfFrame = document.getElementById('viewer-pdf-frame');

  // Initialize
  async function init() {
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

  // Update Counters in Navigation Tabs
  function updateCounters() {
    const total = allTutorials.length;
    const fbCount = allTutorials.filter(t => t.course === 'firstbot').length;
    const obCount = allTutorials.filter(t => t.course === 'onebot').length;
    const tbCount = allTutorials.filter(t => t.course === 'techbot').length;

    countAll.textContent = total;
    countFirstbot.textContent = fbCount;
    countOnebot.textContent = obCount;
    countTechbot.textContent = tbCount;
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

    // Reset Filters
    btnResetFilters.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.hidden = true;
      setCourse('all');
      sortSelect.value = 'default';
      state.sortBy = 'default';
      render();
    });

    // Slide Controls
    btnPrevSlide.addEventListener('click', () => changeSlide(-1));
    btnNextSlide.addEventListener('click', () => changeSlide(1));

    // Fullscreen Toggle
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        viewerDialog.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    });

    // View Mode Toggle (Slides vs PDF)
    btnModeSlides.addEventListener('click', () => switchViewMode('slides'));
    btnModePdf.addEventListener('click', () => switchViewMode('pdf'));

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
      }
    });

    // Reset mode on dialog close
    viewerDialog.addEventListener('close', () => {
      switchViewMode('slides');
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

  // Filter and Sort Pipeline
  function getFilteredTutorials() {
    let list = [...allTutorials];

    // Filter by Course
    if (state.activeCourse !== 'all') {
      list = list.filter(t => t.course === state.activeCourse);
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
      const cNames = { firstbot: 'FirstBot', onebot: 'OneBot', techbot: 'TechBot' };
      filterDetails.push(`Curso: ${cNames[state.activeCourse]}`);
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

      return `
        <article class="robot-card ${courseClass}" data-id="${item.id}" style="--card-accent: var(--color-${item.course}); --card-accent-subtle: var(--color-${item.course}-subtle)">
          <div class="card-header">
            <span class="card-num-badge">#${escapeHtml(item.id.toUpperCase())}</span>
            <span class="card-level-tag">${escapeHtml(item.level)}</span>
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

    // Header info
    viewerRobotName.textContent = `${item.title} (${item.originalTitle})`;
    viewerCoursePill.textContent = item.courseName;
    viewerCoursePill.className = `dialog-course-pill dot-${item.course}`;
    viewerLevelPill.textContent = item.level;
    viewerDownloadBtn.href = item.pdf;
    viewerDownloadBtn.setAttribute('download', `${item.id}_${item.title}.pdf`);

    // PDF fallback frame
    viewerPdfFrame.src = item.pdf;

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
    switchViewMode('slides');

    // Show modal dialog
    viewerDialog.showModal();
  }

  // Update Center Slide Display
  function updateSlideDisplay() {
    if (!currentTutorial || !currentTutorial.slides.length) return;

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

  function switchViewMode(mode) {
    if (mode === 'slides') {
      btnModeSlides.classList.add('active');
      btnModeSlides.setAttribute('aria-selected', 'true');
      btnModePdf.classList.remove('active');
      btnModePdf.setAttribute('aria-selected', 'false');
      slidesViewportWrap.hidden = false;
      pdfFallbackView.hidden = true;
    } else {
      btnModePdf.classList.add('active');
      btnModePdf.setAttribute('aria-selected', 'true');
      btnModeSlides.classList.remove('active');
      btnModeSlides.setAttribute('aria-selected', 'false');
      slidesViewportWrap.hidden = true;
      pdfFallbackView.hidden = false;
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
