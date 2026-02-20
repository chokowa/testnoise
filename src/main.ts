import { NoiseGenerator } from './NoiseGenerator';
import type { NoiseType } from './types';

let audioContext: AudioContext | null = null;
let noiseGenerator: NoiseGenerator | null = null;
let sourceNode: AudioBufferSourceNode | null = null;

const playBtn = document.getElementById('playBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

playBtn.addEventListener('click', async () => {
  try {
    playBtn.disabled = true;
    statusDiv.textContent = 'Status: Initializing...';

    if (!audioContext) {
      audioContext = new AudioContext();
      noiseGenerator = new NoiseGenerator(audioContext);
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
    }

    if (!noiseGenerator) return;

    // Phase 1 テスト: フィルターやVolume(GainNode)を一切介さず直接出力
    // NoiseGenerator で作られたブラウンノイズの AudioBuffer を純粋に再生する
    sourceNode = noiseGenerator.createSource('brown');

    // NOTE: 安全のため極端な大音量を防ぐGainを1枚だけ挟む
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;

    sourceNode.connect(masterGain);
    masterGain.connect(audioContext.destination);

    sourceNode.start(0);

    stopBtn.disabled = false;
    statusDiv.textContent = 'Status: Playing Brown Noise (Pure)';

  } catch (err) {
    console.error(err);
    alert('Playback failed. Check console.');
    playBtn.disabled = false;
    statusDiv.textContent = 'Status: Error';
  }
});

stopBtn.addEventListener('click', () => {
  if (sourceNode) {
    sourceNode.stop();
    sourceNode.disconnect();
    sourceNode = null;
  }

  playBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.textContent = 'Status: Stopped';
});
