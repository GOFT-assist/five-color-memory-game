export const COLORS = [
  { id: 'red', name: 'Red', hex: '#ef4444', sound: 261.63 },
  { id: 'blue', name: 'Blue', hex: '#3b82f6', sound: 329.63 },
  { id: 'green', name: 'Green', hex: '#22c55e', sound: 392.0 },
  { id: 'yellow', name: 'Yellow', hex: '#facc15', sound: 493.88 },
  { id: 'purple', name: 'Purple', hex: '#a855f7', sound: 587.33 },
];

export const DEFAULT_GAME = Object.freeze({
  level: 1,
  score: 0,
  bestLevel: 0,
  sequence: [],
  input: [],
  status: 'idle',
  message: 'Tap Start to play.',
});

export function createGameState(savedBest = 0) {
  return { ...DEFAULT_GAME, bestLevel: Number.isFinite(savedBest) ? savedBest : 0 };
}

export function getRandomColorId(random = Math.random) {
  const index = Math.floor(random() * COLORS.length);
  return COLORS[Math.max(0, Math.min(COLORS.length - 1, index))].id;
}

export function extendSequence(sequence, random = Math.random) {
  return [...sequence, getRandomColorId(random)];
}

export function startGame(random = Math.random, savedBest = 0) {
  const sequence = extendSequence([], random);
  return {
    ...createGameState(savedBest),
    sequence,
    status: 'showing',
    message: 'Watch the colors carefully.',
  };
}

export function markReadyForInput(state) {
  if (state.status !== 'showing') return state;
  return { ...state, status: 'input', input: [], message: `Repeat ${state.sequence.length} color${state.sequence.length === 1 ? '' : 's'}.` };
}

export function registerInput(state, colorId, random = Math.random) {
  if (state.status !== 'input') return state;
  if (!COLORS.some((color) => color.id === colorId)) return state;

  const nextInput = [...state.input, colorId];
  const index = nextInput.length - 1;

  if (state.sequence[index] !== colorId) {
    return {
      ...state,
      input: nextInput,
      status: 'lost',
      bestLevel: Math.max(state.bestLevel, state.level - 1),
      message: `Oops! You reached level ${state.level}. Tap Start to try again.`,
    };
  }

  if (nextInput.length === state.sequence.length) {
    const nextLevel = state.level + 1;
    const nextScore = state.score + state.sequence.length * 10;
    return {
      ...state,
      level: nextLevel,
      score: nextScore,
      bestLevel: Math.max(state.bestLevel, state.level),
      sequence: extendSequence(state.sequence, random),
      input: [],
      status: 'showing',
      message: 'Great job! Watch the next pattern.',
    };
  }

  return {
    ...state,
    input: nextInput,
    message: `${state.sequence.length - nextInput.length} more to go...`,
  };
}

export function colorById(colorId) {
  return COLORS.find((color) => color.id === colorId) ?? null;
}
