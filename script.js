console.log("Potato’s Day v1.3.2");

const workflowOpenButton = document.querySelector("[data-workflow-open]");
const workflowModal = document.querySelector("#workflow-modal");
const workflowCloseButton = document.querySelector("[data-workflow-close]");
const homeView = document.querySelector("[data-home-view]");
const ballGameView = document.querySelector("[data-ball-game-view]");
const spriteLabView = document.querySelector("[data-sprite-lab-view]");
const ballGameOpenButton = document.querySelector("[data-ball-game-open]");
const returnHomeButton = document.querySelector("[data-return-home]");
const spriteLabOpenButton = document.querySelector("[data-sprite-lab-open]");
const spriteLabReturnButton = document.querySelector("[data-sprite-lab-return]");
const spriteLabViewport = document.querySelector("[data-sprite-lab-viewport]");
const spriteLabSheet = document.querySelector("[data-sprite-lab-sheet]");
const spriteLabStatus = document.querySelector("[data-sprite-lab-status]");
const tapBallButton = document.querySelector("[data-tap-ball]");
const playBall = document.querySelector("[data-play-ball]");
const ballPlayGamja = document.querySelector("[data-ball-play-gamja]");
const ballGameMessage = document.querySelector("[data-ball-game-message]");
const gamjaCallButton = document.querySelector("[data-call-gamja]");
const soundToggleButton = document.querySelector("[data-sound-toggle]");
const gamjaMessage = document.querySelector("[data-gamja-message]");
const gamjaCharacter = document.querySelector(".gamja-character");
const gamjaResponses = [
  "멍! 불렀어?",
  "감자가 기분 좋아졌어요!",
  "오늘도 같이 쉬어요.",
  "감자가 반갑게 바라봅니다.",
];
const ballGameResponses = [
  "감자가 공을 톡 쳤어요!",
  "공이 통통 굴러가요.",
  "감자가 신나게 바라봅니다.",
  "감자가 꼬리를 흔드는 기분이에요.",
];
const BALL_PLAY_STATES = Object.freeze({
  READY: "ready",
  ROLLING: "rolling",
  GAMJA_REACTING: "gamja-reacting",
  RETURNING: "returning",
});
const ballPlayStateMessages = {
  [BALL_PLAY_STATES.READY]: "공놀이를 시작할 준비가 되었어요.",
  [BALL_PLAY_STATES.ROLLING]: "공이 감자 쪽으로 굴러가요.",
  [BALL_PLAY_STATES.GAMJA_REACTING]: "감자가 공을 바라보고 있어요.",
  [BALL_PLAY_STATES.RETURNING]: "공이 다시 제자리로 돌아와요.",
};
const ballPlayStateClasses = {
  [BALL_PLAY_STATES.ROLLING]: "is-rolling-to-gamja",
  [BALL_PLAY_STATES.GAMJA_REACTING]: "is-near-gamja",
  [BALL_PLAY_STATES.RETURNING]: "is-returning-home",
};
const BALL_PLAY_TIMING = Object.freeze({
  GAMJA_REACTING: 760,
  RETURNING: 1180,
  READY: 1940,
});
const SPRITE_LAB_FRAME_COUNT = 6;

let gamjaResponseIndex = 0;
let ballGameResponseIndex = 0;
let ballPlayState = BALL_PLAY_STATES.READY;
let gamjaReactionTimer;
let ballRoundTimers = [];
let isSoundEnabled = true;
let gamjaAudioContext;
let didLogAudioUnsupported = false;

if (spriteLabView && spriteLabViewport && spriteLabSheet && spriteLabStatus) {
  const showSpriteLabLoadError = () => {
    spriteLabView.classList.remove("is-sprite-ready");
    spriteLabView.classList.add("is-sprite-error");
    spriteLabStatus.textContent = "Sprite sheet를 불러오지 못했어요. 파일 경로를 확인해주세요.";
  };

  const configureSpriteLabSheet = () => {
    const frameWidth = spriteLabSheet.naturalWidth / SPRITE_LAB_FRAME_COUNT;
    const frameHeight = spriteLabSheet.naturalHeight;

    if (!Number.isFinite(frameWidth) || frameWidth <= 0 || frameHeight <= 0) {
      showSpriteLabLoadError();
      return;
    }

    spriteLabViewport.style.setProperty("--sprite-lab-frame-aspect", `${frameWidth} / ${frameHeight}`);
    spriteLabViewport.dataset.frameWidth = String(frameWidth);
    spriteLabViewport.dataset.frameHeight = String(frameHeight);
    spriteLabView.classList.remove("is-sprite-error");
    spriteLabView.classList.add("is-sprite-ready");
    spriteLabStatus.textContent = `6프레임 반복 재생 중 · 프레임 ${frameWidth} × ${frameHeight}px`;
  };

  spriteLabSheet.addEventListener("load", configureSpriteLabSheet);
  spriteLabSheet.addEventListener("error", showSpriteLabLoadError);

  if (spriteLabSheet.complete) {
    if (spriteLabSheet.naturalWidth > 0) {
      configureSpriteLabSheet();
    } else {
      showSpriteLabLoadError();
    }
  }
}

if (workflowOpenButton && workflowModal && workflowCloseButton) {
  const openWorkflowModal = () => {
    workflowModal.hidden = false;
    workflowOpenButton.setAttribute("aria-expanded", "true");
    workflowCloseButton.focus();
  };

  const closeWorkflowModal = () => {
    workflowModal.hidden = true;
    workflowOpenButton.setAttribute("aria-expanded", "false");
    workflowOpenButton.focus();
  };

  workflowOpenButton.addEventListener("click", openWorkflowModal);
  workflowCloseButton.addEventListener("click", closeWorkflowModal);

  workflowModal.addEventListener("click", (event) => {
    if (event.target === workflowModal) {
      closeWorkflowModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !workflowModal.hidden) {
      closeWorkflowModal();
    }
  });
}

if (
  homeView
  && ballGameView
  && spriteLabView
  && ballGameOpenButton
  && returnHomeButton
  && spriteLabOpenButton
  && spriteLabReturnButton
) {
  const hideView = (view) => {
    view.hidden = true;
    view.classList.add("is-hidden");
  };

  const showView = (view) => {
    view.hidden = false;
    view.classList.remove("is-hidden");
  };

  const showHomeView = (focusTarget) => {
    resetBallPlayRound();
    showView(homeView);
    hideView(ballGameView);
    hideView(spriteLabView);
    focusTarget.focus();
  };

  const showBallGameView = () => {
    hideView(homeView);
    hideView(spriteLabView);
    showView(ballGameView);

    if (tapBallButton) {
      tapBallButton.focus();
    } else {
      returnHomeButton.focus();
    }
  };

  const showSpriteLabView = () => {
    resetBallPlayRound();
    hideView(homeView);
    hideView(ballGameView);
    showView(spriteLabView);
    spriteLabReturnButton.focus();
  };

  ballGameOpenButton.addEventListener("click", showBallGameView);
  returnHomeButton.addEventListener("click", () => showHomeView(ballGameOpenButton));
  spriteLabOpenButton.addEventListener("click", showSpriteLabView);
  spriteLabReturnButton.addEventListener("click", () => showHomeView(spriteLabOpenButton));
}

const updateSoundToggle = () => {
  if (!soundToggleButton) {
    return;
  }

  soundToggleButton.textContent = isSoundEnabled ? "🔈 소리 켜짐" : "🔇 소리 꺼짐";
  soundToggleButton.setAttribute("aria-pressed", String(isSoundEnabled));
  soundToggleButton.setAttribute("aria-label", isSoundEnabled ? "효과음 끄기" : "효과음 켜기");
};

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    if (!didLogAudioUnsupported) {
      console.info("Potato’s Day sound is not supported in this browser.");
      didLogAudioUnsupported = true;
    }

    return null;
  }

  if (!gamjaAudioContext) {
    gamjaAudioContext = new AudioContextClass();
  }

  return gamjaAudioContext;
};

const playGamjaSound = () => {
  if (!isSoundEnabled) {
    return;
  }

  try {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    const playTone = () => {
      const now = audioContext.currentTime;
      const output = audioContext.createGain();
      output.gain.setValueAtTime(0.0001, now);
      output.gain.exponentialRampToValueAtTime(0.06, now + 0.018);
      output.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      output.connect(audioContext.destination);

      [
        { frequency: 660, start: 0, duration: 0.16, type: "sine" },
        { frequency: 990, start: 0.055, duration: 0.17, type: "triangle" },
      ].forEach(({ frequency, start, duration, type }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startAt = now + start;
        const endAt = startAt + duration;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.08, endAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.75, startAt + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

        oscillator.connect(gain);
        gain.connect(output);
        oscillator.start(startAt);
        oscillator.stop(endAt + 0.02);
      });
    };

    if (audioContext.state === "suspended") {
      audioContext.resume().then(playTone).catch(() => {});
      return;
    }

    playTone();
  } catch (error) {
    console.info("Potato’s Day sound could not be played.");
  }
};

if (soundToggleButton) {
  updateSoundToggle();

  soundToggleButton.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    updateSoundToggle();
  });
}

const getNextBallGameResponse = () => {
  const response = ballGameResponses[ballGameResponseIndex % ballGameResponses.length];
  ballGameResponseIndex += 1;

  return response;
};

const clearBallRoundTimers = () => {
  ballRoundTimers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  ballRoundTimers = [];
};

const updateBallPlayButton = () => {
  if (!tapBallButton) {
    return;
  }

  tapBallButton.disabled = ballPlayState !== BALL_PLAY_STATES.READY;
};

const updateBallPlayVisualState = () => {
  if (playBall) {
    Object.values(ballPlayStateClasses).forEach((stateClass) => {
      playBall.classList.remove(stateClass);
    });

    const nextStateClass = ballPlayStateClasses[ballPlayState];

    if (nextStateClass) {
      playBall.classList.add(nextStateClass);
    }
  }

  if (ballPlayGamja) {
    ballPlayGamja.classList.toggle("is-reacting", ballPlayState === BALL_PLAY_STATES.GAMJA_REACTING);
  }
};

const setBallPlayState = (nextState, message = ballPlayStateMessages[nextState]) => {
  if (!Object.values(BALL_PLAY_STATES).includes(nextState)) {
    return;
  }

  ballPlayState = nextState;

  if (ballGameView) {
    ballGameView.dataset.ballPlayState = nextState;
  }

  if (ballGameMessage && message) {
    ballGameMessage.textContent = message;
    ballGameMessage.hidden = false;
  }

  updateBallPlayVisualState();
  updateBallPlayButton();
};

const queueBallPlayState = (nextState, delay, message) => {
  const timer = window.setTimeout(() => {
    setBallPlayState(nextState, message);
  }, delay);

  ballRoundTimers.push(timer);
};

const resetBallPlayRound = () => {
  clearBallRoundTimers();
  setBallPlayState(BALL_PLAY_STATES.READY);
};

const startBallPlayRound = () => {
  if (ballPlayState !== BALL_PLAY_STATES.READY) {
    return;
  }

  const response = getNextBallGameResponse();

  clearBallRoundTimers();
  playGamjaSound();
  setBallPlayState(BALL_PLAY_STATES.ROLLING);
  queueBallPlayState(BALL_PLAY_STATES.GAMJA_REACTING, BALL_PLAY_TIMING.GAMJA_REACTING, response);
  queueBallPlayState(BALL_PLAY_STATES.RETURNING, BALL_PLAY_TIMING.RETURNING);
  queueBallPlayState(BALL_PLAY_STATES.READY, BALL_PLAY_TIMING.READY);
};

if (tapBallButton && playBall && ballGameMessage) {
  updateBallPlayButton();
  tapBallButton.addEventListener("click", startBallPlayRound);
}

if (gamjaCallButton && gamjaMessage && gamjaCharacter) {
  gamjaCallButton.addEventListener("click", () => {
    const response = gamjaResponses[gamjaResponseIndex % gamjaResponses.length];
    gamjaResponseIndex += 1;
    playGamjaSound();

    gamjaMessage.textContent = response;
    gamjaMessage.hidden = false;

    gamjaCharacter.classList.remove("is-happy");
    gamjaMessage.classList.remove("is-happy");
    window.clearTimeout(gamjaReactionTimer);
    void gamjaCharacter.offsetWidth;

    requestAnimationFrame(() => {
      gamjaCharacter.classList.add("is-happy");
      gamjaMessage.classList.add("is-happy");
    });

    gamjaReactionTimer = window.setTimeout(() => {
      gamjaCharacter.classList.remove("is-happy");
      gamjaMessage.classList.remove("is-happy");
    }, 760);
  });
}
