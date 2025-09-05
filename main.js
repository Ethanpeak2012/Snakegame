(() => {
  'use strict';

  // 文本资源（中英）
  const i18n = {
    zh: {
      title: '贪吃蛇',
      score: '分数',
      best: '最高分',
      level: '等级',
      mode: '模式',
      start: '开始',
      pause: '暂停',
      restart: '重来',
      startGame: '开始游戏',
      rulesTitle: '玩法说明',
      rulesList: [
        '电脑：方向键或 WASD 控制；空格开始/暂停；R 重开。',
        '手机：使用屏幕方向键控制；点击"开始/暂停/重来"。',
        '吃到食物加 1 分并增长，达到阈值提升等级与速度。',
        '撞到墙或自身则游戏结束。',
      ],
      chooseMode: '选择难度',
      modes: { easy: '简单', medium: '中等', hard: '困难', inferno: '炼狱' },
      // 玩法说明弹窗
      rulesModalTitle: '游戏玩法说明',
      controlTitle: '控制方式',
      controlPC: '电脑：方向键或 WASD 控制移动',
      controlMobile: '手机：使用屏幕下方的方向键',
      controlKeys: '空格键：开始/暂停游戏',
      controlRestart: 'R键：重新开始游戏',
      gameplayTitle: '游戏规则',
      ruleEat: '吃到食物可以获得1分并增长身体',
      ruleLevel: '达到分数阈值会提升等级和移动速度',
      ruleCollision: '撞到墙壁或自己的身体会游戏结束',
      ruleDifficulty: '选择不同难度会影响初始速度',
      rulesOK: '我知道了',
      overTitle: '游戏结束',
      overScore: '本次得分：',
      overRestart: '再来一局',
      overClose: '关闭',
    },
    en: {
      title: 'Snake',
      score: 'Score',
      best: 'Best',
      level: 'Level',
      mode: 'Mode',
      start: 'Start',
      pause: 'Pause',
      restart: 'Restart',
      startGame: 'Play',
      rulesTitle: 'How to Play',
      rulesList: [
        'Desktop: Arrow keys or WASD; Space to start/pause; R to restart.',
        'Mobile: Use on-screen d-pad; Tap Start/Pause/Restart.',
        'Eat food to gain 1 point and grow. Reach thresholds to level up and increase speed.',
        'Hitting walls or yourself ends the game.',
      ],
      chooseMode: 'Choose Difficulty',
      modes: { easy: 'Easy', medium: 'Medium', hard: 'Hard', inferno: 'Inferno' },
      // Rules modal
      rulesModalTitle: 'How to Play',
      controlTitle: 'Controls',
      controlPC: 'Desktop: Arrow keys or WASD to move',
      controlMobile: 'Mobile: Use on-screen directional pad',
      controlKeys: 'Space: Start/Pause game',
      controlRestart: 'R key: Restart game',
      gameplayTitle: 'Game Rules',
      ruleEat: 'Eat food to gain 1 point and grow your body',
      ruleLevel: 'Reach score thresholds to level up and increase speed',
      ruleCollision: 'Hitting walls or your own body ends the game',
      ruleDifficulty: 'Different difficulties affect initial speed',
      rulesOK: 'Got it!',
      overTitle: 'Game Over',
      overScore: 'Your Score: ',
      overRestart: 'Play Again',
      overClose: 'Close',
    }
  };

  // DOM 元素获取
  const $ = (sel) => document.querySelector(sel);
  const board = $('#board');
  const ctx = board.getContext('2d');
  const scoreEl = $('#score');
  const bestEl = $('#best');
  const levelEl = $('#level');
  const modeNameEl = $('#modeName');
  const btnStart = $('#btnStart');
  const btnPause = $('#btnPause');
  const btnRestart = $('#btnRestart');
  const langZh = $('#langZh');
  const langEn = $('#langEn');
  const appTitle = $('#appTitle');
  const labelScore = $('#labelScore');
  const labelBest = $('#labelBest');
  const labelLevel = $('#labelLevel');
  const labelMode = $('#labelMode');

  const dpadUp = $('#dpadUp');
  const dpadDown = $('#dpadDown');
  const dpadLeft = $('#dpadLeft');
  const dpadRight = $('#dpadRight');

  // 游戏信息界面元素
  const modeTitle = $('#modeTitle');
  const labelEasy = $('#labelEasy');
  const labelMedium = $('#labelMedium');
  const labelHard = $('#labelHard');
  const labelInferno = $('#labelInferno');
  const btnStartGame = $('#btnStartGame');

  // 玩法说明弹窗元素
  const rulesModal = $('#rulesModal');
  const rulesModalTitle = $('#rulesModalTitle');
  const controlTitle = $('#controlTitle');
  const controlPC = $('#controlPC');
  const controlMobile = $('#controlMobile');
  const controlKeys = $('#controlKeys');
  const controlRestart = $('#controlRestart');
  const gameplayTitle = $('#gameplayTitle');
  const ruleEat = $('#ruleEat');
  const ruleLevel = $('#ruleLevel');
  const ruleCollision = $('#ruleCollision');
  const ruleDifficulty = $('#ruleDifficulty');
  const btnRulesOK = $('#btnRulesOK');

  // 游戏结束界面元素
  const over = $('#gameOver');
  const overTitle = $('#overTitle');
  const overScore = $('#overScore');
  const finalScore = $('#finalScore');
  const btnRestart2 = $('#btnRestart2');
  const btnCloseOver = $('#btnCloseOver');

  // 语言设置
  const savedLang = localStorage.getItem('snake_lang');
  let lang = savedLang ? savedLang : ((navigator.language || '').startsWith('zh') ? 'zh' : 'en');

  // 难度模式配置
  const MODES = {
    easy:   { nameKey: 'easy',   startSpeed: 6,  levelStep: 8,  speedInc: 0.5 },
    medium: { nameKey: 'medium', startSpeed: 8,  levelStep: 6,  speedInc: 0.7 },
    hard:   { nameKey: 'hard',   startSpeed: 10, levelStep: 5,  speedInc: 0.9 },
    inferno:{ nameKey: 'inferno',startSpeed: 12, levelStep: 4,  speedInc: 1.2 },
  };

  let currentModeKey = 'easy';
  let modeCfg = MODES[currentModeKey];

  // 游戏参数
  const GRID = 24;
  const CELL = board.width / GRID;
  const BG = '#0d1117';
  const SNAKE_HEAD = '#00e5a8';
  const SNAKE_BODY = '#00b894';
  const FOOD = '#ff7675';
  const GRID_COLOR = 'rgba(255,255,255,0.035)';

  // 游戏状态
  let snake; // [{x,y}]
  let dir;   // {x,y}
  let nextDir;
  let food;
  let running = false;
  let paused = false;
  let score = 0;
  let best = parseInt(localStorage.getItem('snake_best') || '0', 10);
  let speed = 8;
  let lastTime = 0;
  let acc = 0;
  let level = 1;
  let toNextLevel = 0; // 本级已吃食物数

  bestEl.textContent = String(best);

  // 语言设置函数
  function setLang(next) {
    lang = next;
    localStorage.setItem('snake_lang', lang);
    const t = i18n[lang];
    
    // 更新界面文本
    appTitle.textContent = t.title;
    labelScore.textContent = t.score;
    labelBest.textContent = t.best;
    labelLevel.textContent = t.level;
    labelMode.textContent = t.mode;
    btnStart.textContent = t.start;
    btnPause.textContent = t.pause;
    btnRestart.textContent = t.restart;

    // 开始界面
    modeTitle.textContent = t.chooseMode;
    labelEasy.textContent = t.modes.easy;
    labelMedium.textContent = t.modes.medium;
    labelHard.textContent = t.modes.hard;
    labelInferno.textContent = t.modes.inferno;
    btnStartGame.textContent = t.startGame;

    // 游戏结束界面
    overTitle.textContent = t.overTitle;
    overScore.firstChild.nodeValue = t.overScore;
    btnRestart2.textContent = t.overRestart;
    btnCloseOver.textContent = t.overClose;

    // 玩法说明弹窗
    rulesModalTitle.textContent = t.rulesModalTitle;
    controlTitle.textContent = t.controlTitle;
    controlPC.textContent = t.controlPC;
    controlMobile.textContent = t.controlMobile;
    controlKeys.textContent = t.controlKeys;
    controlRestart.textContent = t.controlRestart;
    gameplayTitle.textContent = t.gameplayTitle;
    ruleEat.textContent = t.ruleEat;
    ruleLevel.textContent = t.ruleLevel;
    ruleCollision.textContent = t.ruleCollision;
    ruleDifficulty.textContent = t.ruleDifficulty;
    btnRulesOK.textContent = t.rulesOK;

    // HUD 模式显示
    modeNameEl.textContent = t.modes[modeCfg.nameKey];

    // 更新语言按钮状态
    langZh.classList.toggle('active', lang === 'zh');
    langEn.classList.toggle('active', lang === 'en');

    document.title = `${i18n.zh.title} ${i18n.en.title}`;
  }

  // 游戏重置
  function resetGame() {
    const startX = Math.floor(GRID / 3);
    const startY = Math.floor(GRID / 2);
    snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = '0';
    level = 1;
    levelEl.textContent = '1';
    toNextLevel = 0;
    speed = modeCfg.startSpeed;
    paused = false;
    placeFood();
    hideGameOver();
  }

  // 放置食物
  function placeFood() {
    while (true) {
      const x = Math.floor(Math.random() * GRID);
      const y = Math.floor(Math.random() * GRID);
      if (!snake.some(s => s.x === x && s.y === y)) {
        food = { x, y };
        return;
      }
    }
  }

  // 绘制网格
  function drawGrid() {
    ctx.clearRect(0, 0, board.width, board.height);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, board.width, board.height);
    
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      const p = Math.floor(i * CELL) + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, board.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(board.width, p);
      ctx.stroke();
    }
  }

  // 绘制蛇
  function drawSnake() {
    // 绘制身体
    ctx.fillStyle = SNAKE_BODY;
    for (let i = 1; i < snake.length; i++) {
      const s = snake[i];
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    }
    
    // 绘制头部
    ctx.fillStyle = SNAKE_HEAD;
    const h = snake[0];
    ctx.fillRect(h.x * CELL + 1, h.y * CELL + 1, CELL - 2, CELL - 2);
  }

  // 绘制食物
  function drawFood() {
    ctx.fillStyle = FOOD;
    ctx.beginPath();
    const cx = food.x * CELL + CELL / 2;
    const cy = food.y * CELL + CELL / 2;
    const r = (CELL - 6) / 2;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 验证转向（防止反向）
  function validateTurn(cur, nxt) {
    if (cur.x + nxt.x === 0 && cur.y + nxt.y === 0) return cur;
    return nxt;
  }

  // 检查升级
  function levelUpIfNeeded() {
    if (toNextLevel >= modeCfg.levelStep) {
      toNextLevel = 0;
      level += 1;
      levelEl.textContent = String(level);
      speed = Math.min(20, speed + modeCfg.speedInc);
    }
  }

  // 游戏步进
  function step() {
    dir = validateTurn(dir, nextDir);
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // 碰撞检测
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // 吃食物
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = String(score);
      toNextLevel += 1;
      levelUpIfNeeded();
      placeFood();
    } else {
      snake.pop();
    }
  }

  // 渲染游戏
  function render() {
    drawGrid();
    drawFood();
    drawSnake();
  }

  // 游戏主循环
  function frame(ts) {
    if (!running) return;
    const dt = (ts - lastTime) / 1000;
    lastTime = ts;
    
    if (!paused) {
      acc += dt;
      const spf = 1 / speed;
      while (acc >= spf) {
        step();
        acc -= spf;
      }
      render();
    }
    
    requestAnimationFrame(frame);
  }

  // 启动游戏循环
  function startLoop() {
    running = true;
    lastTime = performance.now();
    acc = 0;
    requestAnimationFrame(frame);
  }

  // 启动游戏
  function startGame() {
    const checked = document.querySelector('input[name="difficulty"]:checked');
    currentModeKey = checked ? checked.value : 'easy';
    modeCfg = MODES[currentModeKey];
    modeNameEl.textContent = i18n[lang].modes[modeCfg.nameKey];
    resetGame();
    startLoop();
  }

  // 游戏控制函数
  function startGame() {
    if (!running) {
      resetGame();
      startLoop();
    }
  }

  function pauseGame() {
    paused = !paused;
  }

  function restartGame() {
    resetGame();
    startLoop();
  }

  // 游戏结束
  function gameOver() {
    running = false;
    paused = false;
    
    if (score > best) {
      best = score;
      localStorage.setItem('snake_best', String(best));
      bestEl.textContent = String(best);
    }
    
    finalScore.textContent = String(score);
    over.classList.remove('hidden');
  }

  // 隐藏游戏结束界面
  function hideGameOver() {
    over.classList.add('hidden');
  }

  // 键盘控制
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') {
      nextDir = { x: 0, y: -1 };
    } else if (k === 'arrowdown' || k === 's') {
      nextDir = { x: 0, y: 1 };
    } else if (k === 'arrowleft' || k === 'a') {
      nextDir = { x: -1, y: 0 };
    } else if (k === 'arrowright' || k === 'd') {
      nextDir = { x: 1, y: 0 };
    } else if (k === ' ') {
      e.preventDefault();
      if (startOverlay.style.display !== 'none') {
        startGameFromOverlay();
      } else if (!running) {
        startGame();
      } else {
        pauseGame();
      }
    } else if (k === 'r') {
      restartGame();
    }
  });

  // 触控方向键
  const bindDpad = (el, vector) => {
    el.addEventListener('click', () => {
      nextDir = vector;
    });
  };
  
  bindDpad(dpadUp, { x: 0, y: -1 });
  bindDpad(dpadDown, { x: 0, y: 1 });
  bindDpad(dpadLeft, { x: -1, y: 0 });
  bindDpad(dpadRight, { x: 1, y: 0 });

  // 按钮事件
  btnStart.addEventListener('click', () => startGame());
  btnPause.addEventListener('click', () => {
    if (running) {
      pauseGame();
    } else {
      startGame();
    }
  });
  btnRestart.addEventListener('click', () => restartGame());
  btnStartGame.addEventListener('click', () => startGame());
  btnRestart2.addEventListener('click', () => {
    restartGame();
    hideGameOver();
  });
  btnCloseOver.addEventListener('click', () => hideGameOver());

  // 语言切换
  langZh.addEventListener('click', () => setLang('zh'));
  langEn.addEventListener('click', () => setLang('en'));

  // 玩法说明弹窗控制
  function showRulesModal() {
    rulesModal.classList.remove('hidden');
  }

  function hideRulesModal() {
    rulesModal.classList.add('hidden');
    localStorage.setItem('snake_rules_shown', 'true');
  }

  btnRulesOK.addEventListener('click', hideRulesModal);

  // 检查是否需要显示玩法说明
  function checkShowRules() {
    const hasShown = localStorage.getItem('snake_rules_shown');
    if (!hasShown) {
      setTimeout(showRulesModal, 500);
    }
  }

  // 难度选择事件
  document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        currentModeKey = radio.value;
        modeCfg = MODES[currentModeKey];
        modeNameEl.textContent = i18n[lang].modes[modeCfg.nameKey];
        if (running) {
          restartGame();
        }
      }
    });
  });

  // 自适应Canvas尺寸
  function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.92, 480);
    board.style.width = board.style.height = `${size}px`;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 初始化
  setLang(lang);
  currentModeKey = 'easy';
  modeCfg = MODES[currentModeKey];
  modeNameEl.textContent = i18n[lang].modes[modeCfg.nameKey];
  resetGame();
  render();
  checkShowRules();
})();