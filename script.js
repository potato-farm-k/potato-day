console.log("Potato’s Day v0.9");

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

let gamjaResponseIndex = 0;
let ballGameResponseIndex = 0;
let gamjaReactionTimer;
let ballReactionTimer;
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

if (tapBallButton && playBall && ballGameMessage) {
  tapBallButton.addEventListener("click", () => {
    const response = ballGameResponses[ballGameResponseIndex % ballGameResponses.length];
    ballGameResponseIndex += 1;
    playGamjaSound();

    ballGameMessage.textContent = response;
    ballGameMessage.hidden = false;

    playBall.classList.remove("is-bouncing");
    window.clearTimeout(ballReactionTimer);
    void playBall.offsetWidth;

    requestAnimationFrame(() => {
      playBall.classList.add("is-bouncing");
    });

    ballReactionTimer = window.setTimeout(() => {
      playBall.classList.remove("is-bouncing");
    }, 650);
  });
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
