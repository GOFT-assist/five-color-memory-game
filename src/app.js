import { COLORS, colorById, markReadyForInput, registerInput, startGame } from './game.js';

const BEST_KEY = 'five-color-memory-game-best-level';
const SHOW_DELAY_MS = 650;
const GAP_MS = 180;

const board = document.querySelector('[data-board]');
const startButton = document.querySelector('[data-start]');
const replayButton = document.querySelector('[data-replay]');
const message = document.querySelector('[data-message]');
const level = document.querySelector('[data-level]');
const score = document.querySelector('[data-score]');
const best = document.querySelector('[data-best]');
const progress = document.querySelector('[data-progress]');
const sequenceList = document.querySelector('[data-sequence-list]');

let audioContext;
let state = startGame(() => 0, readBest());
state = { ...state, status: 'idle', sequence: [], message: 'Tap Start to play.' };
let isAnimating = false;

function readBest() {
  const value = Number.parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
  return Number.isFinite(value) ? value : 0;
}

function saveBest(value) {
  localStorage.setItem(BEST_KEY, String(value));
}

function unlockAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playTone(colorId, duration = 0.22) {
  const color = colorById(colorId);
  if (!audioContext || !color) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = color.sound;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.03);
}

function renderBoard() {
  board.innerHTML = COLORS.map((color) => `
    <button class="color-pad ${color.id}" type="button" data-color="${color.id}" aria-label="${color.name}">
      <span>${color.name}</span>
    </button>
  `).join('');
}

function resetColorPads() {
  board.querySelectorAll('.color-pad').forEach((pad) => {
    pad.classList.remove('active', 'pressed');
    pad.blur();
  });
}

function render() {
  message.textContent = state.message;
  level.textContent = String(state.level);
  score.textContent = String(state.score);
  best.textContent = String(state.bestLevel);
  progress.textContent = state.sequence.length ? `${state.input.length}/${state.sequence.length}` : '0/0';
  startButton.textContent = state.status === 'idle' ? 'Start game' : 'Restart';
  replayButton.disabled = state.status !== 'input' || isAnimating;

  sequenceList.innerHTML = state.sequence
    .map((colorId, index) => {
      const color = colorById(colorId);
      const isDone = index < state.input.length;
      return `<li class="${isDone ? 'done' : ''}" aria-label="Step ${index + 1}: ${color?.name ?? colorId}">${index + 1}</li>`;
    })
    .join('');

  document.body.dataset.status = state.status;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function flashPad(colorId) {
  resetColorPads();
  const pad = board.querySelector(`[data-color="${colorId}"]`);
  if (!pad) return;
  pad.classList.add('active');
  playTone(colorId, 0.28);
  await wait(SHOW_DELAY_MS);
  resetColorPads();
  await wait(GAP_MS);
}

async function showSequence() {
  if (isAnimating || state.status !== 'showing') return;
  isAnimating = true;
  render();
  await wait(450);
  for (const colorId of state.sequence) {
    await flashPad(colorId);
  }
  state = markReadyForInput(state);
  isAnimating = false;
  render();
}

function newGame() {
  unlockAudio();
  state = startGame(Math.random, readBest());
  render();
  showSequence();
}

function handleColorTap(event) {
  const button = event.target.closest('[data-color]');
  if (!button || isAnimating || state.status !== 'input') return;
  unlockAudio();
  const colorId = button.dataset.color;
  resetColorPads();
  button.classList.remove('pressed');
  void button.offsetWidth;
  button.classList.add('pressed');
  button.addEventListener('animationend', resetColorPads, { once: true });
  window.setTimeout(resetColorPads, 220);
  playTone(colorId);
  state = registerInput(state, colorId, Math.random);
  saveBest(state.bestLevel);
  render();
  if (state.status === 'showing') showSequence();
}

startButton.addEventListener('click', newGame);
replayButton.addEventListener('click', () => {
  unlockAudio();
  if (state.status === 'input') {
    state = { ...state, status: 'showing', input: [], message: 'Watch the colors again.' };
    showSequence();
  }
});
board.addEventListener('click', handleColorTap);

renderBoard();
render();
