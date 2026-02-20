import { NoiseGenerator } from './NoiseGenerator.js';

let audioContext = null;
let noiseGenerator = null;
let sourceNode = null;

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');

playBtn.addEventListener('click', async () => {
    try {
        playBtn.disabled = true;
        statusDiv.textContent = 'Status: Initializing...';

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

        // Phase 1 テスト: フィルターやVolumeを一切介さず直接出力
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
        alert('Playback failed: ' + err.message);
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
