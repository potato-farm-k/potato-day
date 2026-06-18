console.log("Potato’s Day v1.1");

const workflowOpenButton = document.querySelector("[data-workflow-open]");
const workflowModal = document.querySelector("#workflow-modal");
const workflowCloseButton = document.querySelector("[data-workflow-close]");
const homeView = document.querySelector("[data-home-view]");
const ballGameView = document.querySelector("[data-ball-game-view]");
const ballGameOpenButton = document.querySelector("[data-ball-game-open]");
const returnHomeButton = document.querySelector("[data-return-home]");
const tapBallButton = document.querySelector("[data-tap-ball]");
const playBall = document.querySelector("[data-play-ball]");
const ballGameMessage = document.querySelector("[data-ball-game-message]");
const gamjaCallButton = document.querySelector("[data-call-gamja]");
const soundToggleButton = document.querySelector("[data-sound-toggle]");
const gamjaStatus = document.querySelector("[data-gamja-status]");
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

let gamjaResponseIndex = 0;
let ballGameResponseIndex = 0;
let ballPlayState = BALL_PLAY_STATES.READY;
let gamjaReactionTimer;
let ballReactionTimer;
let ballRoundTimers = [];
let isSoundEnabled = true;
let gamjaAudioContext;
let didLogAudioUnsupported = false;

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

if (homeView && ballGameView && ballGameOpenButton && returnHomeButton) {
  const showHomeView = () => {
    resetBallPlayRound();
    homeView.hidden = false;
    homeView.classList.remove("is-hidden");
    ballGameView.hidden = true;
    ballGameView.classList.add("is-hidden");
    ballGameOpenButton.focus();
  };

  const showBallGameView = () => {
    homeView.hidden = true;
    homeView.classList.add("is-hidden");
    ballGameView.hidden = false;
    ballGameView.classList.remove("is-hidden");

    if (tapBallButton) {
      tapBallButton.focus();
    } else {
      returnHomeButton.focus();
    }
  };

  ballGameOpenButton.addEventListener("click", showBallGameView);
  returnHomeButton.addEventListener("click", showHomeView);
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

  updateBallPlayButton();
};

const queueBallPlayState = (nextState, delay, message) => {
  const timer = window.setTimeout(() => {
    setBallPlayState(nextState, message);
  }, delay);

  ballRoundTimers.push(timer);
};

const playBallBounce = () => {
  if (!playBall) {
    return;
  }

  playBall.classList.remove("is-bouncing");
  window.clearTimeout(ballReactionTimer);
  void playBall.offsetWidth;

  requestAnimationFrame(() => {
    playBall.classList.add("is-bouncing");
  });

  ballReactionTimer = window.setTimeout(() => {
    playBall.classList.remove("is-bouncing");
  }, 650);
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
  playBallBounce();
  setBallPlayState(BALL_PLAY_STATES.ROLLING);
  queueBallPlayState(BALL_PLAY_STATES.GAMJA_REACTING, 420, response);
  queueBallPlayState(BALL_PLAY_STATES.RETURNING, 920);
  queueBallPlayState(BALL_PLAY_STATES.READY, 1320);
};

if (tapBallButton && playBall && ballGameMessage) {
  updateBallPlayButton();
  tapBallButton.addEventListener("click", startBallPlayRound);
}

if (gamjaCallButton && gamjaStatus && gamjaMessage && gamjaCharacter) {
  gamjaCallButton.addEventListener("click", () => {
    const response = gamjaResponses[gamjaResponseIndex % gamjaResponses.length];
    gamjaResponseIndex += 1;
    playGamjaSound();

    gamjaStatus.textContent = response;
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
