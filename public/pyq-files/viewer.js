const isUsableUrl = (value) => typeof value === 'string' && value.trim() !== '' && value.trim() !== '#';
const normalizeBranch = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '');
const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char
  ));

const fillText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
};

const getEntryTitle = (entry, year, selectedSemester = '') =>
  entry?.title?.trim()
  || entry?.originalFileName?.replace(/\.[^/.]+$/, '')
  || `${entry?.branch || 'General'} Sem ${entry?.semester || selectedSemester || '1'} PYQ ${year}`;

const getFilteredEntries = (items, year, selectedBranch, selectedSemester) => {
  const yearEntries = Array.isArray(items)
    ? items.filter((item) => String(item?.year || '') === year)
    : [];

  if (!yearEntries.length) {
    return [];
  }

  const branchEntries = selectedBranch
    ? yearEntries.filter((item) => normalizeBranch(item?.branch) === selectedBranch)
    : yearEntries;

  let filteredEntries = branchEntries.length ? branchEntries : yearEntries;

  if (selectedSemester) {
    const exactEntries = filteredEntries.filter((item) => String(item?.semester || '') === selectedSemester);
    if (exactEntries.length) {
      filteredEntries = exactEntries;
    } else {
      filteredEntries = filteredEntries.filter((item) => !String(item?.semester || '').trim());
    }
  }

  return [...filteredEntries].sort((first, second) => {
    const updatedTimeDiff = new Date(second?.updatedAt || second?.createdAt || 0) - new Date(first?.updatedAt || first?.createdAt || 0);
    if (updatedTimeDiff !== 0) return updatedTimeDiff;

    return getEntryTitle(first, year, selectedSemester).localeCompare(getEntryTitle(second, year, selectedSemester));
  });
};

const renderRows = (entries, year) => {
  const rowsContainer = document.querySelector('[data-pyq-rows]');
  if (!rowsContainer) return;

  if (!entries.length) {
    rowsContainer.innerHTML = `
      <div class="table-row">
        <div class="cell subject-cell">
          <h2 class="paper-title">${escapeHtml(`${year} Previous Year Questions`)}</h2>
        </div>
        <div class="cell downloads-cell">
          <a class="action-link disabled" href="#" target="_blank" rel="noreferrer">Open Link</a>
          <a class="action-link secondary disabled" href="#">Download</a>
        </div>
      </div>
    `;
    return;
  }

  rowsContainer.innerHTML = entries.map((entry) => {
    const title = getEntryTitle(entry, year);
    const href = isUsableUrl(entry?.url) ? entry.url : '#';
    const disabledClass = isUsableUrl(entry?.url) ? '' : ' disabled';
    const downloadAttribute = isUsableUrl(entry?.url)
      ? ` download="${escapeHtml(entry?.originalFileName || `${title}.pdf`)}"`
      : '';

    return `
      <div class="table-row">
        <div class="cell subject-cell">
          <h2 class="paper-title">${escapeHtml(title)}</h2>
        </div>
        <div class="cell downloads-cell">
          <a class="action-link${disabledClass}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">Open Link</a>
          <a class="action-link secondary${disabledClass}" href="${escapeHtml(href)}"${downloadAttribute}>Download</a>
        </div>
      </div>
    `;
  }).join('');
};

const ensureLayout = (root, year) => {
  if (document.querySelector('[data-pyq-rows]')) {
    return;
  }

  root.innerHTML = `
    <div class="topbar">
      <h1 class="heading" data-pyq-title>${year} Previous Year Questions</h1>
      <div class="context" data-pyq-context>PYQ / ${year}</div>
    </div>
    <p class="subtitle" data-pyq-subtitle>Loading PYQs...</p>
    <div class="table-wrap">
      <div class="table">
        <div class="table-head">
          <div class="cell subject-cell">Question Paper</div>
          <div class="cell">Downloads</div>
        </div>
        <div data-pyq-rows></div>
      </div>
    </div>
  `;
};

const renderViewer = async () => {
  const root = document.querySelector('[data-pyq-year]');
  if (!root) return;

  const year = root.getAttribute('data-pyq-year') || '';
  const queryParams = new URLSearchParams(window.location.search);
  const selectedBranch = normalizeBranch(queryParams.get('branch'));
  const selectedSemester = queryParams.get('semester') || '';
  ensureLayout(root, year);
  fillText('[data-pyq-title]', `${year} Previous Year Questions`);
  fillText('[data-pyq-context]', `PYQ / ${year}`);

  try {
    const response = await fetch('/api/pyqs');
    const data = await response.json();
    const entries = getFilteredEntries(data, year, selectedBranch, selectedSemester);

    if (entries.length) {
      fillText(
        '[data-pyq-subtitle]',
        selectedBranch && selectedSemester
          ? `${entries.length} PYQ${entries.length > 1 ? 's are' : ' is'} available for the selected branch and semester.`
          : `${entries.length} PYQ${entries.length > 1 ? 's are' : ' is'} available for this year.`
      );
      renderRows(entries, year);
      return;
    }

    fillText(
      '[data-pyq-subtitle]',
      selectedBranch && selectedSemester
        ? 'No uploaded PYQs are available for the selected branch and semester yet.'
        : 'No uploaded PYQs are available for this year yet.'
    );
    renderRows([], year);
  } catch (error) {
    fillText('[data-pyq-subtitle]', 'Unable to load the PYQ details right now.');
    renderRows([], year);
  }
};

window.addEventListener('DOMContentLoaded', renderViewer);
