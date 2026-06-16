(function () {
  "use strict";

  const staticLevels = window.WORD_SEARCH_LEVELS || [];
  const createLevel = window.createWordSearchLevel;
  const levelCount = window.WORD_SEARCH_LEVEL_COUNT || staticLevels.length;
  const difficulties = window.WORD_SEARCH_DIFFICULTIES || [
    { key: "easy", label: "Lehká", gridSize: 10 },
    { key: "medium", label: "Střední", gridSize: 13 },
    { key: "hard", label: "Těžká", gridSize: 16 }
  ];
  const defaultDifficulty = window.WORD_SEARCH_DEFAULT_DIFFICULTY || "hard";
  const colors = [
    "#ff8fc7",
    "#63dce2",
    "#ffd166",
    "#8ee8a6",
    "#c9a7ff",
    "#ffb36b",
    "#7fd3ff",
    "#ff9aa2",
    "#9de7d7",
    "#f6a6ff",
    "#c7ef7c",
    "#ffcfdf"
  ];
  const wordDirections = [
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 }
  ];

  const app = document.querySelector("[data-app]");
  const gridEl = document.querySelector("[data-grid]");
  const boardWrap = document.querySelector("[data-board-wrap]");
  const linesEl = document.querySelector("[data-word-lines]");
  const wordListEl = document.querySelector("[data-word-list]");
  const titleEl = document.querySelector("[data-level-title]");
  const difficultySelect = document.querySelector("[data-difficulty-select]");
  const changeLevelButton = document.querySelector("[data-change-level]");
  const resultDialog = document.querySelector("[data-result-dialog]");
  const resultCloseButton = document.querySelector("[data-result-close]");
  const resultNewButton = document.querySelector("[data-result-new]");
  const resultTitleEl = document.querySelector("[data-result-title]");
  const resultSecretEl = document.querySelector("[data-result-secret]");

  const state = {
    levelIndex: 0,
    difficulty: readDifficulty(),
    level: null,
    matrix: [],
    activePointerId: null,
    startCell: null,
    currentCells: [],
    found: new Map(),
    preview: null,
    cellSize: 0
  };
  let wordFitFrame = null;

  if (!levelCount) {
    app.innerHTML = "<p class=\"empty-state\">Nenalezen žádný level.</p>";
    return;
  }

  init();

  function init() {
    updateViewportSize();
    changeLevelButton.addEventListener("click", changeLevel);
    resultCloseButton.addEventListener("click", hideResultDialog);
    resultNewButton.addEventListener("click", () => {
      hideResultDialog();
      changeLevel();
    });
    resultDialog.addEventListener("click", onResultDialogClick);
    document.addEventListener("keydown", onDocumentKeyDown);
    difficultySelect.addEventListener("change", () => changeDifficulty(difficultySelect.value));
    window.addEventListener("resize", onViewportChange);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onViewportChange);
      window.visualViewport.addEventListener("scroll", onViewportChange);
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(scheduleLineRender).observe(boardWrap);
      new ResizeObserver(scheduleWordFit).observe(wordListEl);
    }

    loadLevel(chooseRandomLevel(readLastLevelIndex(state.difficulty)));
  }

  function onViewportChange() {
    updateViewportSize();
    scheduleLineRender();
    scheduleWordFit();
  }

  function updateViewportSize() {
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--visual-height", `${Math.floor(height)}px`);
  }

  function loadLevel(index) {
    clearSelection();
    state.levelIndex = index;
    state.level = getLevel(index, state.difficulty);
    state.matrix = state.level.rows.map((row) => [...row]);
    state.found.clear();
    state.preview = null;
    state.currentCells = [];
    state.startCell = null;

    validateLevel(state.level);
    saveLastLevelIndex(index, state.difficulty);
    saveDifficulty(state.difficulty);
    updateDifficultyControl();

    titleEl.textContent = state.level.title;
    document.title = `${state.level.title} - Slovní hledací hádanka`;

    hideResultDialog();
    gridEl.replaceChildren();
    wordListEl.replaceChildren();
    linesEl.replaceChildren();

    gridEl.style.setProperty("--grid-size", state.matrix.length);
    renderGrid();
    renderWords();
    updateProgress();
    scheduleLineRender();
    scheduleWordFit();
  }

  function changeLevel() {
    loadLevel(chooseRandomLevel(state.levelIndex));
  }

  function changeDifficulty(difficulty) {
    if (!getDifficultyDefinition(difficulty) || difficulty === state.difficulty) return;

    state.difficulty = difficulty;
    loadLevel(chooseRandomLevel(readLastLevelIndex(difficulty)));
  }

  function chooseRandomLevel(excludedIndex) {
    if (levelCount === 1) return 0;

    let index = Math.floor(Math.random() * levelCount);

    while (index === excludedIndex) {
      index = Math.floor(Math.random() * levelCount);
    }

    return index;
  }

  function getLevel(index, difficulty) {
    if (typeof createLevel === "function") {
      return createLevel(index, { difficulty });
    }

    return staticLevels[index];
  }

  function readDifficulty() {
    try {
      const stored = window.localStorage.getItem("wordSearchDifficulty");

      return getDifficultyDefinition(stored) ? stored : defaultDifficulty;
    } catch (error) {
      return defaultDifficulty;
    }
  }

  function saveDifficulty(difficulty) {
    try {
      window.localStorage.setItem("wordSearchDifficulty", difficulty);
    } catch (error) {
      return;
    }
  }

  function readLastLevelIndex(difficulty) {
    try {
      const stored = window.localStorage.getItem(getLastLevelKey(difficulty));
      const index = Number(stored);
      return Number.isInteger(index) ? index : -1;
    } catch (error) {
      return -1;
    }
  }

  function saveLastLevelIndex(index, difficulty) {
    try {
      window.localStorage.setItem(getLastLevelKey(difficulty), String(index));
    } catch (error) {
      return;
    }
  }

  function getLastLevelKey(difficulty) {
    return `wordSearchLastLevel:${difficulty}`;
  }

  function getDifficultyDefinition(difficulty) {
    return difficulties.find((item) => item.key === difficulty);
  }

  function updateDifficultyControl() {
    difficultySelect.value = state.difficulty;
  }

  function validateLevel(level) {
    const size = level.rows.length;
    const invalidRow = level.rows.find((row) => [...row].length !== size);

    if (invalidRow) {
      throw new Error("Level musí mít čtvercovou mřížku.");
    }

    level.words.forEach((wordEntry) => {
      const word = getWordText(wordEntry);
      const cells = getWordCells(wordEntry);

      if (cells && getSelectedWord(cells) !== word) {
        throw new Error(`Slovo ${word} neodpovídá své pozici v levelu.`);
      }

      if (cells) {
        const occurrences = findWordOccurrences(word);

        if (occurrences.length !== 1 || !cellsEqual(occurrences[0], cells)) {
          throw new Error(`Slovo ${word} musí být v levelu právě jednou.`);
        }
      }
    });
  }

  function renderGrid() {
    const fragment = document.createDocumentFragment();

    state.matrix.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const cell = document.createElement("button");
        cell.className = "cell";
        cell.type = "button";
        cell.dataset.row = String(rowIndex);
        cell.dataset.col = String(colIndex);
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", `${letter}, řádek ${rowIndex + 1}, sloupec ${colIndex + 1}`);
        cell.innerHTML = `<span>${letter}</span>`;
        cell.addEventListener("pointerdown", onPointerDown);
        cell.addEventListener("pointerenter", onPointerEnter);
        fragment.appendChild(cell);
      });
    });

    gridEl.appendChild(fragment);
  }

  function renderWords() {
    const fragment = document.createDocumentFragment();

    state.level.words.forEach((wordEntry, index) => {
      const item = document.createElement("li");
      const word = getWordText(wordEntry);

      item.className = "word-chip";
      item.dataset.word = word;
      item.style.setProperty("--chip-color", colors[index % colors.length]);
      item.textContent = word;
      fragment.appendChild(item);
    });

    wordListEl.appendChild(fragment);
  }

  function scheduleWordFit() {
    if (wordFitFrame !== null) {
      window.cancelAnimationFrame(wordFitFrame);
    }

    wordFitFrame = window.requestAnimationFrame(() => {
      wordFitFrame = null;
      fitWordList();
    });
  }

  function fitWordList() {
    let scale = 1;
    const minimumScale = 0.4;

    wordListEl.style.setProperty("--word-scale", String(scale));

    while (wordListEl.scrollHeight > wordListEl.clientHeight + 1 && scale > minimumScale) {
      scale = Math.max(minimumScale, scale - 0.03);
      wordListEl.style.setProperty("--word-scale", scale.toFixed(2));
    }
  }

  function onPointerDown(event) {
    const cell = event.currentTarget;

    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (state.activePointerId !== null) clearSelection();

    event.preventDefault();
    if (gridEl.setPointerCapture) {
      gridEl.setPointerCapture(event.pointerId);
    }
    state.activePointerId = event.pointerId;
    state.startCell = readCell(cell);
    state.currentCells = [state.startCell];
    state.preview = {
      cells: state.currentCells,
      color: "#63dce2"
    };

    gridEl.classList.add("is-selecting");
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    renderLines();
  }

  function onPointerEnter(event) {
    if (state.activePointerId === null) return;
    updateSelection(readCell(event.currentTarget));
  }

  function onPointerMove(event) {
    if (event.pointerId !== state.activePointerId) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const cell = target && target.closest("[data-row][data-col]");
    if (!cell || !gridEl.contains(cell)) return;

    updateSelection(readCell(cell));
  }

  function onPointerUp(event) {
    if (event.pointerId !== state.activePointerId) return;
    finishSelection();
  }

  function onPointerCancel(event) {
    if (event.pointerId !== state.activePointerId) return;
    clearSelection();
  }

  function updateSelection(endCell) {
    if (!state.startCell) return;

    const cells = getLineCells(state.startCell, endCell);
    if (!cells.length) return;

    state.currentCells = cells;
    state.preview = {
      cells,
      color: "#63dce2"
    };
    renderLines();
  }

  function finishSelection() {
    const selectedWord = getSelectedWord(state.currentCells);
    const wordEntry = findMatchingWord(selectedWord, state.currentCells);

    if (wordEntry) {
      const word = getWordText(wordEntry);
      const color = getWordColor(word);
      state.found.set(word, {
        cells: state.currentCells.slice(),
        color
      });
      markWordFound(word, color);
      updateProgress();
    }

    clearSelection();
  }

  function clearSelection() {
    if (
      state.activePointerId !== null &&
      gridEl.hasPointerCapture &&
      gridEl.hasPointerCapture(state.activePointerId)
    ) {
      gridEl.releasePointerCapture(state.activePointerId);
    }

    state.activePointerId = null;
    state.startCell = null;
    state.currentCells = [];
    state.preview = null;
    gridEl.classList.remove("is-selecting");
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
    renderLines();
  }

  function findMatchingWord(selectedWord, selectedCells) {
    if (!selectedWord) return null;
    const reversed = reverseText(selectedWord);

    return state.level.words.find((wordEntry) => {
      const word = getWordText(wordEntry);
      const answerCells = getWordCells(wordEntry);

      if (state.found.has(word)) return false;
      if (word !== selectedWord && word !== reversed) return false;
      if (!answerCells) return true;

      return cellsEqual(selectedCells, answerCells) || cellsEqual(selectedCells, answerCells.slice().reverse());
    }) || null;
  }

  function markWordFound(word, color) {
    const item = [...wordListEl.children].find((child) => child.dataset.word === word);
    if (!item) return;

    item.classList.add("is-found");
    item.style.setProperty("--chip-color", color);
  }

  function getWordColor(word) {
    const index = state.level.words.findIndex((wordEntry) => getWordText(wordEntry) === word);
    return colors[Math.max(0, index) % colors.length];
  }

  function updateProgress() {
    if (state.found.size === state.level.words.length) {
      revealSecret();
    }
  }

  function revealSecret() {
    showResultDialog();
  }

  function showResultDialog() {
    resultTitleEl.textContent = "Vyřešeno";
    resultSecretEl.textContent = state.level.solution || `${state.level.clue} ${state.level.secret}`;
    resultDialog.hidden = false;
    resultCloseButton.focus();
  }

  function hideResultDialog() {
    resultDialog.hidden = true;
  }

  function onResultDialogClick(event) {
    if (event.target === resultDialog) {
      hideResultDialog();
    }
  }

  function onDocumentKeyDown(event) {
    if (event.key === "Escape" && !resultDialog.hidden) {
      hideResultDialog();
    }
  }

  function getLineCells(start, end) {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const rowStep = Math.sign(rowDiff);
    const colStep = Math.sign(colDiff);
    const rowDistance = Math.abs(rowDiff);
    const colDistance = Math.abs(colDiff);

    if (rowDistance === 0 && colDistance === 0) return [start];
    if (rowDistance !== 0 && colDistance !== 0 && rowDistance !== colDistance) return [];

    const length = Math.max(rowDistance, colDistance) + 1;
    const cells = [];

    for (let index = 0; index < length; index += 1) {
      cells.push({
        row: start.row + rowStep * index,
        col: start.col + colStep * index
      });
    }

    return cells;
  }

  function getSelectedWord(cells) {
    return cells.map((cell) => state.matrix[cell.row][cell.col]).join("");
  }

  function findWordOccurrences(word) {
    const letters = [...word];
    const occurrences = [];

    state.matrix.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        if (letter !== letters[0]) return;

        wordDirections.forEach((direction) => {
          const endRow = rowIndex + direction.row * (letters.length - 1);
          const endCol = colIndex + direction.col * (letters.length - 1);

          if (!isCellInside(endRow, endCol)) return;

          const cells = [];

          for (let index = 0; index < letters.length; index += 1) {
            const cell = {
              row: rowIndex + direction.row * index,
              col: colIndex + direction.col * index
            };

            if (state.matrix[cell.row][cell.col] !== letters[index]) return;
            cells.push(cell);
          }

          occurrences.push(cells);
        });
      });
    });

    return occurrences;
  }

  function isCellInside(row, col) {
    return row >= 0 && col >= 0 && row < state.matrix.length && col < state.matrix.length;
  }

  function renderLines() {
    const rect = boardWrap.getBoundingClientRect();
    linesEl.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    linesEl.replaceChildren();

    state.found.forEach((entry) => drawLine(entry.cells, entry.color, "found-line"));

    if (state.preview && state.preview.cells.length > 1) {
      drawLine(state.preview.cells, state.preview.color, "preview-line");
    }
  }

  function drawLine(cells, color, className) {
    const first = cells[0];
    const last = cells[cells.length - 1];
    const start = getCellCenter(first);
    const end = getCellCenter(last);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const extension = Math.max(4, state.cellSize * 0.08);
    const strokeWidth = Math.max(13, state.cellSize * 0.56);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", String(start.x - dx / length * extension));
    line.setAttribute("y1", String(start.y - dy / length * extension));
    line.setAttribute("x2", String(end.x + dx / length * extension));
    line.setAttribute("y2", String(end.y + dy / length * extension));
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", String(strokeWidth));
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("class", className);
    linesEl.appendChild(line);
  }

  function getCellCenter(cell) {
    const cellEl = getCellEl(cell);
    const cellRect = cellEl.getBoundingClientRect();
    const boardRect = boardWrap.getBoundingClientRect();
    state.cellSize = Math.min(cellRect.width, cellRect.height);

    return {
      x: cellRect.left - boardRect.left + cellRect.width / 2,
      y: cellRect.top - boardRect.top + cellRect.height / 2
    };
  }

  function scheduleLineRender() {
    window.requestAnimationFrame(renderLines);
  }

  function getCellEl(cell) {
    return gridEl.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
  }

  function readCell(cellEl) {
    return {
      row: Number(cellEl.dataset.row),
      col: Number(cellEl.dataset.col)
    };
  }

  function getWordText(wordEntry) {
    return typeof wordEntry === "string" ? wordEntry : wordEntry.text;
  }

  function getWordCells(wordEntry) {
    return typeof wordEntry === "string" ? null : wordEntry.cells;
  }

  function cellsEqual(first, second) {
    if (!first || !second || first.length !== second.length) return false;

    return first.every((cell, index) => cell.row === second[index].row && cell.col === second[index].col);
  }

  function reverseText(text) {
    return [...text].reverse().join("");
  }
}());
