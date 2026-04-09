import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#39ff14', '#ffffff', '#5ed29c']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#39ff14', '#ffffff', '#5ed29c']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export const playSuccessSound = () => {
  try {
    const audio = new Audio('https://cdn.freesound.org/previews/320/320655_527080-lq.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));
  } catch (e) {
    console.log('Audio not supported', e);
  }
};

export const playLevelUpSound = () => {
  try {
    const audio = new Audio('https://cdn.freesound.org/previews/122/122255_1074082-lq.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));
  } catch (e) {
    console.log('Audio not supported', e);
  }
};

export const playAchievementSound = () => {
  try {
    const audio = new Audio('https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));
  } catch (e) {
    console.log('Audio not supported', e);
  }
};
