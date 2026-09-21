(() => {
  "use strict";

  const LOGICAL_WIDTH = 1920;
  const LOGICAL_HEIGHT = 1080;
  const STORAGE_KEY = "capau-egito-v5";

  // 64 casas com distribuição simétrica inspirada na probabilidade de 2d6.
  const NUMBER_DISTRIBUTION = {
    2: 2,
    3: 3,
    4: 6,
    5: 7,
    6: 9,
    7: 10,
    8: 9,
    9: 7,
    10: 6,
    11: 3,
    12: 2,
  };

  const NUMBER_POOL = Object.entries(NUMBER_DISTRIBUTION).flatMap(([number, count]) =>
    Array.from({ length: count }, () => Number(number))
  );

  const RESOURCES = {
    food: { label: "Alimento", image: "assets/recursos/alimento.webp" },
    wood: { label: "Madeira", image: "assets/recursos/madeira.webp" },
    stone: { label: "Pedra", image: "assets/recursos/pedra.webp" },
    ore: { label: "Minério", image: "assets/recursos/minerio.webp" },
  };

  // 64 casas / 4 recursos = 16 fichas de cada recurso.
  const RESOURCE_POOL = Object.keys(RESOURCES).flatMap((resource) =>
    Array.from({ length: 16 }, () => resource)
  );

  const COLORS = {
    red:    { label: "Vermelho", value: "#E5484D" },
    blue:   { label: "Azul", value: "#3573DC" },
    green:  { label: "Verde", value: "#2D9F68" },
    yellow: { label: "Amarelo", value: "#F2C84B" },
    black:  { label: "Preto", value: "#1E2024" },
    purple: { label: "Roxo", value: "#8D58D7" },
  };

  const COLOR_KEYS = Object.keys(COLORS);

  const PIECES = {
    village: { label: "Vilarejo", short: "Vilarejo", image: "assets/construcoes/vilarejo.png" },
    city: { label: "Cidade", short: "Cidade", image: "assets/construcoes/cidade.png" },
    university: { label: "Universidade", short: "Universidade", image: "assets/construcoes/universidade.png" },
    rural: { label: "Zona rural", short: "Zona rural", image: "assets/construcoes/zona-rural.png" },
    metallurgy: { label: "Metalúrgica", short: "Metalúrgica", image: "assets/construcoes/metalurgica.png" },
    commercialCenter: { label: "Centro Comercial", short: "Centro Comercial", image: "assets/construcoes/centrocomercial.png" },
    embassy: { label: "Embaixada", short: "Embaixada", image: "assets/construcoes/embaixada.png" },
    oracle: { label: "Oráculo", short: "Oráculo", image: "assets/construcoes/oraculo.png" },
    tradingPost: { label: "Entreposto Comercial", short: "Entreposto Comercial", image: "assets/construcoes/entrepostocomercial.png" },
    buildersGuild: { label: "Guilda dos Construtores", short: "Guilda dos Construtores", image: "assets/construcoes/guildaconstrutores.png" },
    stable: { label: "Estábulo", short: "Estábulo", image: "assets/construcoes/estabulo.png" },
    archersCamp: { label: "Campo de Arqueiros", short: "Campo de Arqueiros", image: "assets/construcoes/arqueiros.png" },
    barracks: { label: "Quartel", short: "Quartel", image: "assets/construcoes/quartel.png" },
    warships: { label: "Navios de Guerra", short: "Navios de Guerra", image: "assets/construcoes/navio.png" },
    siegeWeapons: { label: "Armas de Cerco", short: "Armas de Cerco", image: "assets/construcoes/armasdecerco.png" },
    monument: { label: "Monumento", short: "Monumento", image: "assets/construcoes/monumento.png" },
    port: { label: "Porto", short: "Porto", image: "assets/construcoes/porto.png" },
  };

  // Grade medida diretamente no novo tabuleiro 1440×1080.
  // 8 colunas × 8 linhas = 64 regiões. Os pontos ficam nas interseções tracejadas.
  const GRID_X = [182, 358, 542, 726, 898, 1080, 1262];
  const GRID_Y = [136, 270, 404, 538, 672, 812, 948];

  const PORT_ONLY = new Set([
    "p-0-1", "p-0-5",
    "p-2-3", "p-6-3",
  ]);

  // Centro geométrico dos 64 retângulos do novo mapa.
  const NUMBER_X = [91, 270, 450, 634, 812, 989, 1171, 1351];
  const NUMBER_Y = [68, 203, 337, 471, 605, 742, 880, 1014];

  const DIE_FACES = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  const dom = {
    mapScreen: document.getElementById("mapScreen"),
    egyptMapCard: document.querySelector('[data-map="egito"]'),
    setupScreen: document.getElementById("setupScreen"),
    gameScreen: document.getElementById("gameScreen"),
    playerCountPicker: document.getElementById("playerCountPicker"),
    setupPlayers: document.getElementById("setupPlayers"),
    setupError: document.getElementById("setupError"),
    startGameButton: document.getElementById("startGameButton"),
    continueGameButton: document.getElementById("continueGameButton"),

    stage: document.getElementById("stage"),
    roadsLayer: document.getElementById("roadsLayer"),
    pointsLayer: document.getElementById("pointsLayer"),
    numbersLayer: document.getElementById("numbersLayer"),

    undoButton: document.getElementById("undoButton"),
    newGameButton: document.getElementById("newGameButton"),
    setupButton: document.getElementById("setupButton"),
    fullscreenButton: document.getElementById("fullscreenButton"),
    rollDiceButton: document.getElementById("rollDiceButton"),
    die1: document.getElementById("die1"),
    die2: document.getElementById("die2"),
    diceTotal: document.getElementById("diceTotal"),
    passTurnButton: document.getElementById("passTurnButton"),

    roundLabel: document.getElementById("roundLabel"),
    turnStatus: document.getElementById("turnStatus"),
    turnCard: document.getElementById("turnCard"),
    currentPlayerDot: document.getElementById("currentPlayerDot"),
    currentPlayerName: document.getElementById("currentPlayerName"),
    playersCountLabel: document.getElementById("playersCountLabel"),
    playersList: document.getElementById("playersList"),

    contextMenu: document.getElementById("contextMenu"),
    menuEyebrow: document.getElementById("menuEyebrow"),
    menuTitle: document.getElementById("menuTitle"),
    menuItems: document.getElementById("menuItems"),

    dialogBackdrop: document.getElementById("dialogBackdrop"),
    confirmNewGame: document.getElementById("confirmNewGame"),
    cancelNewGame: document.getElementById("cancelNewGame"),
    toast: document.getElementById("toast"),
  };

  let state = loadState();
  let setupCount = state?.players?.length || 2;
  let setupDraft = state?.players?.map((player) => ({ ...player })) || createDefaultPlayers(setupCount);
  let undoStack = [];
  let currentMenuTarget = null;
  let menuOpener = null;
  let toastTimer = null;
  let diceRolling = false;

  function init() {
    preloadImages();
    bindMapEvents();
    bindSetupEvents();
    bindGlobalEvents();
    renderDie(dom.die1, state?.lastDice?.[0] || 1, 1);
    renderDie(dom.die2, state?.lastDice?.[1] || 1, 2);
    dom.diceTotal.textContent = String((state?.lastDice?.[0] || 1) + (state?.lastDice?.[1] || 1));
    showMapSelection();
  }

  function preloadImages() {
    [...Object.values(PIECES), ...Object.values(RESOURCES)].forEach((item) => {
      const image = new Image();
      image.src = item.image;
    });
  }

  function createDefaultPlayers(count) {
    return Array.from({ length: count }, (_, index) => ({
      name: `Jogador ${index + 1}`,
      color: COLOR_KEYS[index],
    }));
  }

  function createFreshState(players) {
    return {
      version: 5,
      players: players.map((player) => ({ ...player })),
      currentPlayerIndex: 0,
      round: 1,
      turnHasRolled: false,
      lastDice: [1, 1],
      lastRolledTotal: null,
      numbers: shuffle([...NUMBER_POOL]),
      resources: shuffle([...RESOURCE_POOL]),
      points: {},
      roads: {},
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const validNumbers = Array.isArray(saved?.numbers)
        && saved.numbers.length === NUMBER_POOL.length
        && sameMultiset(saved.numbers, NUMBER_POOL);
      const validResources = Array.isArray(saved?.resources)
        && saved.resources.length === RESOURCE_POOL.length
        && [...saved.resources].sort().join("|") === [...RESOURCE_POOL].sort().join("|");
      const validPlayers = Array.isArray(saved?.players)
        && saved.players.length >= 2
        && saved.players.length <= 6
        && saved.players.every((player) => player?.name && COLORS[player?.color])
        && new Set(saved.players.map((player) => player.color)).size === saved.players.length;

      if (saved?.version === 5 && validNumbers && validResources && validPlayers) {
        return {
          version: 5,
          players: saved.players.map((player) => ({ ...player })),
          currentPlayerIndex: Number.isInteger(saved.currentPlayerIndex)
            ? Math.min(Math.max(saved.currentPlayerIndex, 0), saved.players.length - 1)
            : 0,
          round: Number.isInteger(saved.round) && saved.round > 0 ? saved.round : 1,
          turnHasRolled: Boolean(saved.turnHasRolled),
          lastDice: Array.isArray(saved.lastDice) && saved.lastDice.length === 2
            ? saved.lastDice
            : [1, 1],
          lastRolledTotal: Number.isInteger(saved.lastRolledTotal) ? saved.lastRolledTotal : null,
          numbers: [...saved.numbers],
          resources: [...saved.resources],
          points: saved.points && typeof saved.points === "object" ? saved.points : {},
          roads: saved.roads && typeof saved.roads === "object" ? saved.roads : {},
        };
      }
    } catch (error) {
      console.warn("Não foi possível carregar a partida salva.", error);
    }
    return null;
  }

  function saveState() {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function sameMultiset(a, b) {
    return [...a].sort((x, y) => x - y).join(",") === [...b].sort((x, y) => x - y).join(",");
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function bindMapEvents() {
    dom.egyptMapCard?.addEventListener("click", () => {
      showSetup();
    });
  }

  function showMapSelection() {
    closeMenu(false);
    dom.gameScreen.hidden = true;
    dom.setupScreen.hidden = true;
    dom.mapScreen.hidden = false;
    requestAnimationFrame(() => dom.egyptMapCard?.focus({ preventScroll: true }));
  }

  function bindSetupEvents() {
    dom.startGameButton.addEventListener("click", startConfiguredGame);
    dom.continueGameButton.addEventListener("click", enterGame);
  }

  function showSetup() {
    closeMenu(false);

    if (state?.players?.length) {
      setupCount = state.players.length;
      setupDraft = state.players.map((player) => ({ ...player }));
      dom.continueGameButton.hidden = false;
      dom.continueGameButton.textContent = "Continuar partida";
    } else {
      setupCount = Math.min(Math.max(setupCount, 2), 6);
      ensureSetupDraft();
      dom.continueGameButton.hidden = true;
    }

    renderSetup();
    dom.mapScreen.hidden = true;
    dom.gameScreen.hidden = true;
    dom.setupScreen.hidden = false;
  }

  function ensureSetupDraft() {
    const current = setupDraft.slice(0, setupCount).map((player, index) => ({
      name: player?.name || `Jogador ${index + 1}`,
      color: COLORS[player?.color] ? player.color : null,
    }));

    const used = new Set(current.map((player) => player.color).filter(Boolean));

    while (current.length < setupCount) {
      const color = COLOR_KEYS.find((key) => !used.has(key));
      used.add(color);
      current.push({
        name: `Jogador ${current.length + 1}`,
        color,
      });
    }

    current.forEach((player, index) => {
      if (!player.color || current.some((other, otherIndex) => otherIndex !== index && other.color === player.color)) {
        const occupiedByOthers = new Set(
          current
            .filter((_, otherIndex) => otherIndex !== index)
            .map((other) => other.color)
            .filter(Boolean)
        );
        player.color = COLOR_KEYS.find((key) => !occupiedByOthers.has(key)) || COLOR_KEYS[index];
      }
    });

    setupDraft = current;
  }

  function renderSetup() {
    ensureSetupDraft();
    renderPlayerCountPicker();
    renderSetupPlayers();
    hideSetupError();
  }

  function renderPlayerCountPicker() {
    dom.playerCountPicker.replaceChildren();

    for (let count = 2; count <= 6; count += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `count-button${count === setupCount ? " active" : ""}`;
      button.textContent = String(count);
      button.setAttribute("aria-pressed", String(count === setupCount));
      button.addEventListener("click", () => {
        setupCount = count;
        ensureSetupDraft();
        renderSetup();
      });
      dom.playerCountPicker.append(button);
    }
  }

  function renderSetupPlayers() {
    dom.setupPlayers.replaceChildren();
    const usedColors = setupDraft.map((player) => player.color);

    setupDraft.forEach((player, index) => {
      const card = document.createElement("section");
      card.className = "setup-player-card";
      card.style.setProperty("--player-color", COLORS[player.color]?.value || "#ffffff");

      const heading = document.createElement("div");
      heading.className = "setup-player-heading";
      heading.innerHTML = `
        <span class="setup-player-index">${index + 1}</span>
        <label for="playerName-${index}">Jogador ${index + 1}</label>
      `;

      const input = document.createElement("input");
      input.id = `playerName-${index}`;
      input.className = "player-name-input";
      input.type = "text";
      input.maxLength = 24;
      input.autocomplete = "off";
      input.value = player.name;
      input.placeholder = `Nome do jogador ${index + 1}`;
      input.addEventListener("input", () => {
        setupDraft[index].name = input.value;
        hideSetupError();
      });

      const colorRow = document.createElement("div");
      colorRow.className = "setup-color-row";
      colorRow.setAttribute("aria-label", `Cor do jogador ${index + 1}`);

      COLOR_KEYS.forEach((colorKey) => {
        const color = COLORS[colorKey];
        const selected = player.color === colorKey;
        const taken = usedColors.some((usedColor, usedIndex) => usedIndex !== index && usedColor === colorKey);

        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = `setup-color-swatch${selected ? " selected" : ""}`;
        swatch.style.setProperty("--swatch-color", color.value);
        swatch.title = taken ? `${color.label} — já escolhida` : color.label;
        swatch.setAttribute("aria-label", color.label);
        swatch.setAttribute("aria-pressed", String(selected));
        swatch.disabled = taken;
        swatch.addEventListener("click", () => {
          setupDraft[index].color = colorKey;
          renderSetupPlayers();
          hideSetupError();
        });
        colorRow.append(swatch);
      });

      card.append(heading, input, colorRow);
      dom.setupPlayers.append(card);
    });
  }

  function hideSetupError() {
    dom.setupError.hidden = true;
    dom.setupError.textContent = "";
  }

  function showSetupError(message) {
    dom.setupError.textContent = message;
    dom.setupError.hidden = false;
  }

  function startConfiguredGame() {
    const players = setupDraft.slice(0, setupCount).map((player) => ({
      name: player.name.trim(),
      color: player.color,
    }));

    if (players.some((player) => !player.name)) {
      showSetupError("Informe o nome de todos os jogadores.");
      return;
    }

    if (new Set(players.map((player) => player.color)).size !== players.length) {
      showSetupError("Cada jogador precisa ter uma cor diferente.");
      return;
    }

    state = createFreshState(players);
    undoStack = [];
    saveState();
    enterGame();
    showToast(`Partida iniciada. ${currentPlayer().name} começa.`);
  }

  function enterGame() {
    if (!state) return;
    dom.mapScreen.hidden = true;
    dom.setupScreen.hidden = true;
    dom.gameScreen.hidden = false;
    renderAll();
    requestAnimationFrame(() => dom.rollDiceButton?.focus({ preventScroll: true }));
  }

  function renderAll() {
    renderNumbers();
    renderRoads();
    renderPoints();
    renderSidePanel();
    renderSavedDice();
  }

  function currentPlayer() {
    return state?.players?.[state.currentPlayerIndex] || null;
  }

  function playerForColor(colorKey) {
    return state?.players?.find((player) => player.color === colorKey) || null;
  }

  function renderSidePanel() {
    if (!state) return;

    const player = currentPlayer();
    const palette = COLORS[player.color];

    dom.turnCard.style.setProperty("--turn-color", palette.value);
    dom.currentPlayerDot.style.background = palette.value;
    dom.currentPlayerName.textContent = player.name;
    dom.roundLabel.textContent = `Rodada ${state.round}`;
    dom.turnStatus.textContent = state.turnHasRolled
      ? "Construa ou passe a vez"
      : "Role os dados";
    dom.playersCountLabel.textContent = `${state.players.length} jogadores`;

    dom.playersList.replaceChildren();

    state.players.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = `player-row${index === state.currentPlayerIndex ? " active" : ""}`;
      row.style.setProperty("--player-color", COLORS[item.color].value);

      const marker = document.createElement("span");
      marker.className = "player-row-marker";
      marker.textContent = String(index + 1);

      const dot = document.createElement("span");
      dot.className = "player-list-dot";
      dot.style.background = COLORS[item.color].value;

      const info = document.createElement("div");
      info.className = "player-row-info";
      info.innerHTML = `
        <strong></strong>
        <span>${COLORS[item.color].label}</span>
      `;
      info.querySelector("strong").textContent = item.name;

      const status = document.createElement("span");
      status.className = "player-row-status";
      status.textContent = index === state.currentPlayerIndex ? "Agora" : "";

      row.append(marker, dot, info, status);
      dom.playersList.append(row);
    });

    dom.rollDiceButton.disabled = diceRolling || state.turnHasRolled;
    dom.rollDiceButton.textContent = state.turnHasRolled ? "Rolado" : "Rolar";
    dom.passTurnButton.disabled = !state.turnHasRolled || diceRolling;
    dom.undoButton.disabled = undoStack.length === 0;
  }

  function renderSavedDice() {
    const [a, b] = state?.lastDice || [1, 1];
    renderDie(dom.die1, a, 1);
    renderDie(dom.die2, b, 2);
    dom.diceTotal.textContent = String(a + b);
    dom.diceTotal.setAttribute("aria-label", `Total dos dados: ${a + b}`);
  }

  function renderNumbers() {
    dom.numbersLayer.replaceChildren();
    if (!state) return;

    let index = 0;

    NUMBER_Y.forEach((y) => {
      NUMBER_X.forEach((x) => {
        const number = state.numbers[index];
        const resourceKey = state.resources[index];
        const resource = RESOURCES[resourceKey] || RESOURCES.food;
        const slot = document.createElement("div");

        slot.className = "number-slot tile-slot";
        slot.style.left = `${(x / LOGICAL_WIDTH) * 100}%`;
        slot.style.top = `${(y / LOGICAL_HEIGHT) * 100}%`;
        slot.dataset.number = String(number);
        slot.dataset.resource = resourceKey;
        slot.setAttribute("aria-label", `${resource.label}, número ${number}`);

        const token = document.createElement("img");
        token.className = "resource-token";
        token.src = resource.image;
        token.alt = "";
        token.draggable = false;

        const badge = document.createElement("span");
        badge.className = "tile-number";
        badge.textContent = String(number);
        badge.setAttribute("aria-hidden", "true");

        token.addEventListener("error", () => {
          token.hidden = true;
          slot.classList.add("resource-image-error");
          slot.style.setProperty("--resource-fallback", `"${resource.label.slice(0, 1)}"`);
        });

        slot.append(token, badge);

        if (number === state.lastRolledTotal) {
          slot.classList.add("rolled-number");
        }

        dom.numbersLayer.append(slot);
        index += 1;
      });
    });
  }

  function renderPoints() {
    dom.pointsLayer.replaceChildren();
    if (!state) return;

    GRID_Y.forEach((y, row) => {
      GRID_X.forEach((x, col) => {
        const id = `p-${row}-${col}`;
        const portOnly = PORT_ONLY.has(id);
        const placement = state.points[id];
        const button = document.createElement("button");

        button.type = "button";
        button.className = `point-hotspot${portOnly ? " port-only" : ""}${placement ? " has-piece" : ""}`;
        button.style.left = `${(x / LOGICAL_WIDTH) * 100}%`;
        button.style.top = `${(y / LOGICAL_HEIGHT) * 100}%`;
        button.dataset.id = id;
        button.dataset.kind = portOnly ? "port" : "build";
        button.setAttribute("aria-haspopup", "menu");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", getPointAriaLabel(id, portOnly));

        if (placement) {
          button.append(createPieceMarker(placement.piece, placement.color));
        }

        button.addEventListener("click", (event) => {
          event.stopPropagation();
          openPointMenu(button, event.clientX, event.clientY);
        });

        button.addEventListener("keydown", (event) => {
          if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            const rect = button.getBoundingClientRect();
            openPointMenu(button, rect.right + 8, rect.top + rect.height / 2, event.key === "ArrowUp");
          }
        });

        dom.pointsLayer.append(button);
      });
    });
  }

  function getPointAriaLabel(id, portOnly) {
    const placement = state.points[id];

    if (!placement) {
      return portOnly ? "Local de porto" : "Local de construção";
    }

    const pieceLabel = PIECES[placement.piece]?.label || "Construção";
    const owner = playerForColor(placement.color);
    return `${pieceLabel} de ${owner?.name || COLORS[placement.color]?.label || "jogador"}`;
  }

  function renderRoads() {
    dom.roadsLayer.replaceChildren();
    if (!state) return;

    buildRoadDefinitions().forEach((road) => {
      const ns = "http://www.w3.org/2000/svg";
      const group = document.createElementNS(ns, "g");
      group.classList.add("road-group");
      group.dataset.id = road.id;

      const placement = state.roads[road.id];

      if (placement) {
        group.classList.add("has-road");
        const palette = getPiecePalette(placement.color);
        group.style.setProperty("--road-color", palette.fill);
        group.style.setProperty("--road-outline", palette.roadOutline);
      }

      const outline = svgLine("road-outline", road);
      const color = svgLine("road-color", road);
      const hover = svgLine("road-hover", road);
      const hit = svgLine("road-hit", road);

      hit.setAttribute("role", "button");
      hit.setAttribute("tabindex", "0");
      hit.setAttribute("aria-haspopup", "menu");

      const owner = placement ? playerForColor(placement.color) : null;
      hit.setAttribute(
        "aria-label",
        placement
          ? `Estrada de ${owner?.name || COLORS[placement.color]?.label || "jogador"}`
          : "Trecho de estrada"
      );

      hit.addEventListener("click", (event) => {
        event.stopPropagation();
        openRoadMenu(hit, road.id, event.clientX, event.clientY);
      });

      hit.addEventListener("keydown", (event) => {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          const stageRect = dom.stage.getBoundingClientRect();
          const midX = ((road.x1 + road.x2) / 2 / LOGICAL_WIDTH) * stageRect.width + stageRect.left;
          const midY = ((road.y1 + road.y2) / 2 / LOGICAL_HEIGHT) * stageRect.height + stageRect.top;
          openRoadMenu(hit, road.id, midX, midY, event.key === "ArrowUp");
        }
      });

      group.append(outline, color, hover, hit);
      dom.roadsLayer.append(group);
    });
  }

  function buildRoadDefinitions() {
    const roads = [];

    GRID_Y.forEach((y, row) => {
      for (let col = 0; col < GRID_X.length - 1; col += 1) {
        roads.push({
          id: `rh-${row}-${col}`,
          x1: GRID_X[col],
          y1: y,
          x2: GRID_X[col + 1],
          y2: y,
        });
      }
    });

    GRID_X.forEach((x, col) => {
      for (let row = 0; row < GRID_Y.length - 1; row += 1) {
        roads.push({
          id: `rv-${col}-${row}`,
          x1: x,
          y1: GRID_Y[row],
          x2: x,
          y2: GRID_Y[row + 1],
        });
      }
    });

    return roads;
  }

  function svgLine(className, road) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", className);
    line.setAttribute("x1", road.x1);
    line.setAttribute("y1", road.y1);
    line.setAttribute("x2", road.x2);
    line.setAttribute("y2", road.y2);
    return line;
  }

  function guardTurnAction() {
    if (!state?.turnHasRolled) {
      showToast(`${currentPlayer()?.name || "Jogador"}, role os dados antes de construir.`);
      return false;
    }
    return true;
  }

  function guardOwnership(placement) {
    if (!placement) return true;
    const player = currentPlayer();

    if (placement.color !== player.color) {
      const owner = playerForColor(placement.color);
      showToast(`Este local pertence a ${owner?.name || "outro jogador"}.`);
      return false;
    }

    return true;
  }

  function openPointMenu(button, clientX, clientY, focusLast = false) {
    closeMenu(false);
    if (!guardTurnAction()) return;

    const id = button.dataset.id;
    const portOnly = button.dataset.kind === "port";
    const placement = state.points[id];

    if (!guardOwnership(placement)) return;

    currentMenuTarget = { type: "point", id, portOnly };
    menuOpener = button;
    button.setAttribute("aria-expanded", "true");

    dom.menuEyebrow.textContent = portOnly ? "Porto" : "Construção";
    dom.menuTitle.textContent = placement
      ? `${PIECES[placement.piece].label} · ${currentPlayer().name}`
      : (portOnly ? "Construir porto" : "Escolha a construção");

    const options = portOnly
      ? [{ action: "piece", piece: "port" }]
      : [
          { action: "piece", piece: "village" },
          { action: "piece", piece: "city" },
          { action: "piece", piece: "university" },
          { action: "piece", piece: "rural" },
          { action: "piece", piece: "metallurgy" },
          { action: "piece", piece: "commercialCenter" },
          { action: "piece", piece: "embassy" },
          { action: "piece", piece: "oracle" },
          { action: "piece", piece: "tradingPost" },
          { action: "piece", piece: "buildersGuild" },
          { action: "piece", piece: "stable" },
          { action: "piece", piece: "archersCamp" },
          { action: "piece", piece: "barracks" },
          { action: "piece", piece: "warships" },
          { action: "piece", piece: "siegeWeapons" },
          { action: "piece", piece: "monument" },
        ];

    if (placement) options.push({ action: "remove" });

    populateMenu(options);
    showMenuAt(clientX, clientY, focusLast);
  }

  function openRoadMenu(opener, roadId, clientX, clientY, focusLast = false) {
    closeMenu(false);
    if (!guardTurnAction()) return;

    const placement = state.roads[roadId];
    if (!guardOwnership(placement)) return;

    currentMenuTarget = { type: "road", id: roadId };
    menuOpener = opener;

    dom.menuEyebrow.textContent = "Estrada";
    dom.menuTitle.textContent = placement
      ? `Estrada · ${currentPlayer().name}`
      : "Construir neste trecho";

    const options = [{ action: "road" }];
    if (placement) options.push({ action: "remove" });

    populateMenu(options);
    showMenuAt(clientX, clientY, focusLast);
  }

  function populateMenu(options) {
    dom.menuItems.replaceChildren();
    const player = currentPlayer();
    const activeColor = COLORS[player.color];

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `menu-item${option.action === "remove" ? " danger" : ""}`;
      button.setAttribute("role", "menuitem");

      let label = "";
      let hint = "";
      let iconMarkup = "";

      if (option.action === "piece") {
        const piece = PIECES[option.piece];
        label = piece.label;
        hint = player.name;
        button.style.setProperty("--menu-accent", activeColor.value);
        iconMarkup = `
          <span class="menu-icon menu-icon-piece" aria-hidden="true">
            <span class="menu-piece-ring"></span>
            <img class="menu-piece-image" src="${piece.image}" alt="" draggable="false">
          </span>
        `;
      } else if (option.action === "road") {
        label = state.roads[currentMenuTarget.id] ? "Manter estrada" : "Construir estrada";
        hint = player.name;
        button.style.setProperty("--menu-accent", activeColor.value);
        iconMarkup = `
          <span class="menu-icon" aria-hidden="true">${menuUtilitySvg("road")}</span>
        `;
      } else {
        label = "Remover";
        hint = "Deixar o local vazio";
        iconMarkup = `
          <span class="menu-icon" aria-hidden="true">${menuUtilitySvg("remove")}</span>
        `;
      }

      button.innerHTML = `
        ${iconMarkup}
        <span class="menu-item-text">
          <span class="menu-item-label">${label}</span>
          <span class="menu-item-hint">${hint}</span>
        </span>
      `;

      const menuImage = button.querySelector(".menu-piece-image");
      if (menuImage) {
        menuImage.addEventListener("error", () => {
          menuImage.hidden = true;
          menuImage.closest(".menu-icon-piece")?.classList.add("image-error");
        });
      }

      button.addEventListener("click", () => applyMenuAction(option));
      dom.menuItems.append(button);
    });
  }

  function showMenuAt(clientX, clientY, focusLast) {
    dom.contextMenu.hidden = false;
    dom.contextMenu.setAttribute("aria-hidden", "false");
    dom.contextMenu.style.left = "0px";
    dom.contextMenu.style.top = "0px";

    requestAnimationFrame(() => {
      const rect = dom.contextMenu.getBoundingClientRect();
      const gap = 10;
      let x = clientX + 10;
      let y = clientY + 8;

      if (x + rect.width + gap > window.innerWidth) x = clientX - rect.width - 10;
      if (y + rect.height + gap > window.innerHeight) y = window.innerHeight - rect.height - gap;
      if (x < gap) x = gap;
      if (y < gap) y = gap;

      dom.contextMenu.style.left = `${x}px`;
      dom.contextMenu.style.top = `${y}px`;

      const items = [...dom.contextMenu.querySelectorAll('[role="menuitem"]')];
      (focusLast ? items.at(-1) : items[0])?.focus({ preventScroll: true });
    });
  }

  function closeMenu(returnFocus = true) {
    if (dom.contextMenu.hidden) return;

    if (menuOpener?.setAttribute) {
      menuOpener.setAttribute("aria-expanded", "false");
    }

    dom.contextMenu.hidden = true;
    dom.contextMenu.setAttribute("aria-hidden", "true");
    currentMenuTarget = null;

    if (returnFocus && menuOpener?.focus) {
      menuOpener.focus({ preventScroll: true });
    }

    menuOpener = null;
  }

  function applyMenuAction(option) {
    if (!currentMenuTarget || !state) return;

    const player = currentPlayer();
    pushUndo();

    if (currentMenuTarget.type === "point") {
      const { id } = currentMenuTarget;

      if (option.action === "remove") {
        delete state.points[id];
        showToast("Construção removida.");
      } else if (option.action === "piece") {
        state.points[id] = {
          piece: option.piece,
          color: player.color,
        };
        showToast(`${PIECES[option.piece].label} construído por ${player.name}.`);
      }

      saveState();
      closeMenu(false);
      renderPoints();
    } else if (currentMenuTarget.type === "road") {
      const { id } = currentMenuTarget;

      if (option.action === "remove") {
        delete state.roads[id];
        showToast("Estrada removida.");
      } else {
        state.roads[id] = { color: player.color };
        showToast(`Estrada construída por ${player.name}.`);
      }

      saveState();
      closeMenu(false);
      renderRoads();
    }

    renderSidePanel();
  }

  function pushUndo() {
    if (!state) return;
    undoStack.push(JSON.stringify(state));
    if (undoStack.length > 50) undoStack.shift();
    dom.undoButton.disabled = false;
  }

  function undo() {
    const previous = undoStack.pop();
    if (!previous) return;

    state = JSON.parse(previous);
    saveState();
    renderAll();
    showToast("Última alteração desfeita.");
  }

  function passTurn() {
    if (!state?.turnHasRolled || diceRolling) return;

    pushUndo();
    closeMenu(false);

    state.currentPlayerIndex += 1;

    if (state.currentPlayerIndex >= state.players.length) {
      state.currentPlayerIndex = 0;
      state.round += 1;
    }

    state.turnHasRolled = false;
    state.lastRolledTotal = null;
    saveState();
    renderNumbers();
    renderSidePanel();

    const player = currentPlayer();
    showToast(`Vez de ${player.name}. Role os dados.`);
  }

  function openNewGameDialog() {
    closeMenu(false);
    dom.dialogBackdrop.hidden = false;
    requestAnimationFrame(() => dom.confirmNewGame.focus());
  }

  function closeNewGameDialog() {
    dom.dialogBackdrop.hidden = true;
    dom.newGameButton?.focus({ preventScroll: true });
  }

  function restartGame() {
    if (!state) return;

    const players = state.players.map((player) => ({ ...player }));
    state = createFreshState(players);
    undoStack = [];
    saveState();
    closeNewGameDialog();
    renderAll();
    showToast(`Partida reiniciada. ${currentPlayer().name} começa.`);
  }

  function bindGlobalEvents() {
    dom.undoButton.addEventListener("click", undo);
    dom.newGameButton.addEventListener("click", openNewGameDialog);
    dom.setupButton.addEventListener("click", showSetup);
    dom.fullscreenButton.addEventListener("click", toggleFullscreen);
    dom.passTurnButton.addEventListener("click", passTurn);
    dom.rollDiceButton.addEventListener("click", rollDice);
    dom.confirmNewGame.addEventListener("click", restartGame);
    dom.cancelNewGame.addEventListener("click", closeNewGameDialog);

    dom.dialogBackdrop.addEventListener("pointerdown", (event) => {
      if (event.target === dom.dialogBackdrop) closeNewGameDialog();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!dom.contextMenu.hidden && !dom.contextMenu.contains(event.target)) {
        closeMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!dom.dialogBackdrop.hidden) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeNewGameDialog();
          return;
        }
        trapDialogFocus(event);
        return;
      }

      if (!dom.contextMenu.hidden) {
        handleMenuKeyboard(event);
      }
    });

    document.addEventListener("fullscreenchange", updateFullscreenButton);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  }

  function handleMenuKeyboard(event) {
    const items = [...dom.contextMenu.querySelectorAll('[role="menuitem"]')];
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      items[(baseIndex + delta + items.length) % items.length].focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      items[0].focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      items.at(-1).focus();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const delta = event.shiftKey ? -1 : 1;
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      items[(baseIndex + delta + items.length) % items.length].focus();
    }
  }

  function trapDialogFocus(event) {
    if (event.key !== "Tab") return;

    const focusable = [dom.cancelNewGame, dom.confirmNewGame];
    const index = focusable.indexOf(document.activeElement);
    const delta = event.shiftKey ? -1 : 1;
    const next = focusable[(index + delta + focusable.length) % focusable.length];

    event.preventDefault();
    next.focus();
  }

  function randomDieFace() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function renderDie(element, value, dieNumber) {
    if (!element) return;

    const activePositions = DIE_FACES[value] || DIE_FACES[1];
    element.replaceChildren();

    activePositions.forEach((position) => {
      const pip = document.createElement("span");
      pip.className = `mini-die-dot p${position}`;
      element.append(pip);
    });

    element.setAttribute("aria-label", `Dado ${dieNumber} mostrando ${value}`);
  }

  function highlightRolledNumber(total) {
    dom.numbersLayer.querySelectorAll(".number-slot").forEach((slot) => {
      slot.classList.toggle("rolled-number", Number(slot.dataset.number) === total);
    });
  }

  function rollDice() {
    if (!state || state.turnHasRolled || diceRolling) return;

    closeMenu(false);
    diceRolling = true;
    renderSidePanel();

    dom.die1.classList.remove("rolling");
    dom.die2.classList.remove("rolling");
    void dom.die1.offsetWidth;
    dom.die1.classList.add("rolling");
    dom.die2.classList.add("rolling");

    let ticks = 0;

    const previewTimer = window.setInterval(() => {
      renderDie(dom.die1, randomDieFace(), 1);
      renderDie(dom.die2, randomDieFace(), 2);
      ticks += 1;

      if (ticks >= 7) {
        window.clearInterval(previewTimer);

        const resultA = randomDieFace();
        const resultB = randomDieFace();
        const total = resultA + resultB;

        state.lastDice = [resultA, resultB];
        state.lastRolledTotal = total;
        state.turnHasRolled = true;
        saveState();

        renderDie(dom.die1, resultA, 1);
        renderDie(dom.die2, resultB, 2);
        dom.diceTotal.textContent = String(total);
        dom.diceTotal.setAttribute("aria-label", `Resultado: ${resultA} mais ${resultB}, total ${total}`);
        highlightRolledNumber(total);

        window.setTimeout(() => {
          dom.die1.classList.remove("rolling");
          dom.die2.classList.remove("rolling");
          diceRolling = false;
          renderSidePanel();
          showToast(`${currentPlayer().name} tirou ${total}. Construa ou passe a vez.`);
        }, 180);
      }
    }, 70);
  }

  async function toggleFullscreen() {
    try {
      const root = document.documentElement;
      const request = root.requestFullscreen || root.webkitRequestFullscreen;
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      const active = document.fullscreenElement || document.webkitFullscreenElement;

      if (request && exit) {
        if (!active) {
          await request.call(root);
        } else {
          await exit.call(document);
        }
        return;
      }

      document.body.classList.toggle("pseudo-fullscreen");
      updateFullscreenButton();
      showToast(
        document.body.classList.contains("pseudo-fullscreen")
          ? "Modo ampliado ativado."
          : "Modo ampliado desativado."
      );
    } catch (error) {
      console.warn("Tela cheia indisponível.", error);
      document.body.classList.toggle("pseudo-fullscreen");
      updateFullscreenButton();
    }
  }

  function updateFullscreenButton() {
    const active = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.body.classList.contains("pseudo-fullscreen")
    );

    dom.fullscreenButton.setAttribute("aria-label", active ? "Sair da tela cheia" : "Entrar em tela cheia");
    dom.fullscreenButton.title = active ? "Sair da tela cheia" : "Tela cheia";
  }

  function createPieceMarker(pieceKey, colorKey) {
    const piece = PIECES[pieceKey] || PIECES.village;
    const playerColor = COLORS[colorKey]?.value || COLORS.red.value;

    const marker = document.createElement("span");
    marker.className = "piece-marker piece-marker-image";
    marker.style.setProperty("--player-color", playerColor);

    const image = document.createElement("img");
    image.className = "piece-image";
    image.src = piece.image;
    image.alt = "";
    image.draggable = false;

    const fallback = document.createElement("span");
    fallback.className = "piece-fallback";
    fallback.textContent = piece.short.slice(0, 1).toUpperCase();
    fallback.setAttribute("aria-hidden", "true");

    const ownerDot = document.createElement("span");
    ownerDot.className = "piece-owner-dot";
    ownerDot.setAttribute("aria-hidden", "true");

    image.addEventListener("error", () => {
      marker.classList.add("image-error");
      image.hidden = true;
    });

    marker.append(image, fallback, ownerDot);
    return marker;
  }

  function getPiecePalette(colorKey) {
    const color = COLORS[colorKey]?.value || COLORS.red.value;

    return {
      fill: color,
      roadOutline: colorKey === "black"
        ? "#F7EEDC"
        : "rgba(46, 33, 22, 0.94)",
    };
  }

  function menuUtilitySvg(name) {
    const icons = {
      road: `
        <svg viewBox="0 0 24 24">
          <path d="M4 20 10 4M14 20l6-16M9 8h6M7 14h6"/>
        </svg>
      `,
      remove: `
        <svg viewBox="0 0 24 24">
          <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>
        </svg>
      `,
    };

    return icons[name] || icons.road;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    toastTimer = window.setTimeout(() => dom.toast.classList.remove("show"), 1900);
  }

  init();
})();
