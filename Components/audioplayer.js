import "./libs/webaudiocontrols.js";

const style = `
<style>
    :host {
        font-family: sans-serif;
        display: block;
        width: 100%;
    }
    
    .player {
        border: 2px solid #000;
        border-radius: 10px;
        padding: 20px;
        box-sizing: border-box;
        display: flex; 
        flex-direction: row; 
        background-color: #955353;
        width: 100%;
        gap: 30px;
        color: white;
    }

    .left-column { flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .right-column { width: 350px; background-color: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; display: flex; flex-direction: column; }

    canvas {
        background-color: #111;
        border: 1px solid #333;
        border-radius: 5px;
        width: 100%;
    }
    #spectrumCanvas { height: 180px; }
    #waveformCanvas { height: 100px; margin-top: -10px; }

    .progress-container {
        display: flex;
        align-items: center;
        gap: 15px;
        background: rgba(0,0,0,0.2);
        padding: 10px 15px;
        border-radius: 8px;
    }
    .time-display {
        font-family: monospace;
        font-size: 14px;
        min-width: 45px;
    }
    .progress-bar {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 10px;
        border-radius: 5px;
        background: #555;
        outline: none;
        cursor: pointer;
    }
    .progress-bar::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
    }
    .progress-bar::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
        border: none;
    }

    .controls-row {
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: rgba(0,0,0,0.1);
        padding: 10px;
        border-radius: 8px;
    }

    .buttons-group button {
        margin: 0 5px;
        padding: 10px 15px;
        font-size: 14px;
        border: none;
        border-radius: 5px;
        background-color: #000;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s;
    }
    .buttons-group button:hover { background-color: #333; }
    .buttons-group button.active-btn { color: #ffba84; font-weight: bold; border-bottom: 2px solid #ffba84; }

    .sliders-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; }
    .eq-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid #ffba84; }

    .slider-item { display: flex; flex-direction: column; }
    label { font-size: 0.9em; margin-bottom: 5px; display: flex; justify-content: space-between;}
    input[type=range] { width: 100%; cursor: pointer; }
    select { padding: 5px; background: #222; color: white; border: 1px solid #555; }

    h2 { margin-top: 0; font-size: 1.5em; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px;}
    #playlistTracks { overflow-y: auto; flex-grow: 1; }

    .track-item { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s; font-size: 1.1em; }
    .track-item:hover { background-color: rgba(255,255,255,0.1); padding-left: 15px; }
    .track-item.active { background-color: #000; color: #fff; font-weight: bold; border-left: 5px solid #ff66b2; }
</style>`;

const html = `
<div class="player">
    <audio id="myaudio" crossorigin="anonymous"></audio>
    
    <div class="left-column">
        <canvas id="spectrumCanvas"></canvas>
        <canvas id="waveformCanvas"></canvas>
        
        <div class="progress-container">
            <span class="time-display" id="currentTimeDisplay">00:00</span>
            <input type="range" id="progressBar" class="progress-bar" min="0" max="100" value="0" step="0.1">
            <span class="time-display" id="durationDisplay">00:00</span>
        </div>

        <div class="controls-row">
            <div class="buttons-group">
                <button id="prevButton">⏮ Prev</button>
                <button id="playButton">▶ Play</button>
                <button id="pauseButton">⏸ Pause</button>
                <button id="nextButton">Next ⏭</button>
                <button id="shuffleButton">⇄ Shuffle</button>
                <button id="loopButton">🔁 Loop All</button>
            </div>
            
            <div style="display: flex; flex-direction: column; align-items: center;">
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 14px;">Volume</p>
                <webaudio-knob id="volumeKnob" src="Components/assets/images/Donald_Duck.png" diameter="80" min="0" max="1" step="0.01" value="1"></webaudio-knob>
            </div>
        </div>

        <div class="eq-grid">
            <div style="grid-column: span 6; text-align: center; font-weight: bold; color: #ffba84; margin-bottom: 10px;">Equalizer 6-Bandes</div>
            <div class="slider-item"><label>60Hz <span id="gain0">0 dB</span></label><input type="range" class="eq-slider" data-idx="0" min="-30" max="30" value="0" /></div>
            <div class="slider-item"><label>170Hz <span id="gain1">0 dB</span></label><input type="range" class="eq-slider" data-idx="1" min="-30" max="30" value="0" /></div>
            <div class="slider-item"><label>350Hz <span id="gain2">0 dB</span></label><input type="range" class="eq-slider" data-idx="2" min="-30" max="30" value="0" /></div>
            <div class="slider-item"><label>1KHz <span id="gain3">0 dB</span></label><input type="range" class="eq-slider" data-idx="3" min="-30" max="30" value="0" /></div>
            <div class="slider-item"><label>3.5KHz <span id="gain4">0 dB</span></label><input type="range" class="eq-slider" data-idx="4" min="-30" max="30" value="0" /></div>
            <div class="slider-item"><label>10KHz <span id="gain5">0 dB</span></label><input type="range" class="eq-slider" data-idx="5" min="-30" max="30" value="0" /></div>
        </div>

        <div class="sliders-grid">
            <div class="slider-item"><label>Balance (L - R)</label><input type="range" min="-1" max="1" step="0.1" value="0" id="pannerSlider" /></div>
            <div class="slider-item"><label>Reverb (Dry / Wet)</label><input type="range" min="0" max="1" step="0.01" value="0" id="convolverSlider" /></div>
            <div class="slider-item" style="grid-column: span 2;">
                <label>Master Filter Type</label>
                <select id="biquadFilterTypeSelector">
                    <option value="lowpass" selected>Lowpass</option>
                    <option value="highpass">Highpass</option>
                    <option value="bandpass">Bandpass</option>
                    <option value="lowshelf">Lowshelf</option>
                    <option value="highshelf">Highshelf</option>
                    <option value="peaking">Peaking</option>
                    <option value="notch">Notch</option>
                    <option value="allpass">Allpass</option>
                </select>
            </div>
            <div class="slider-item"><label id="freqLabel">Freq: 350 Hz</label><input type="range" min="20" max="20000" step="1" value="350" id="biquadFilterFrequencySlider" /></div>
            <div class="slider-item"><label id="detuneLabel">Detune: 0</label><input type="range" min="0" max="1000" step="1" value="0" id="biquadFilterDetuneSlider" /></div>
            <div class="slider-item"><label id="qLabel">Q: 1</label><input type="range" min="0.1" max="20" step="0.1" value="1" id="biquadFilterQSlider" /></div>
        </div>
    </div>

    <div class="right-column">
        <h2>Playlist</h2>
        <div id="playlistTracks"></div>
    </div>
</div>
`;

class MyAudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.playlist = [
            { title: "Gachiakuta - EP9", url: "./Components/assets/sons/Ride to Canvas Town Gachiakuta EP9 OST Cover.mp3" },
            { title: "STARGAZING", url: "./Components/assets/sons/STARGAZING.mp3" },
            { title: "Don Toliver ft Yeat - RDV ",url: "./Components/assets/sons/Don Toliver Rendezvous feat.Yeat Official Visualizer.mp3"},
            { title: "Test Audio (Web)", url: "https://mainline.i3s.unice.fr/mooc/LaSueur.mp3" }
        ];

        this.currentTrackIndex = 0;
        this.isShuffling = false;
        this.loopMode = 0;

        this.audioCtx = null;
        this.sourceNode = null;
        this.pannerNode = null;
        this.filterNode = null;
        this.convolverNode = null;
        this.convolverGain = null;
        this.directGain = null;
        this.impulseURL = "https://mainline.i3s.unice.fr/mooc/Scala-Milan-Opera-Hall.wav";

        this.analyser = null;
        this.timeDataArray = null;
        this.freqDataArray = null;
        this.eqFilters = [];

        this.isDraggingProgress = false;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = style + html;
        this.renderPlaylist();

        const resizeObserver = new ResizeObserver(() => this.resizeCanvas());
        resizeObserver.observe(this);

        const audioElement = this.shadowRoot.querySelector('#myaudio');
        audioElement.src = this.playlist[this.currentTrackIndex].url;

        audioElement.addEventListener('ended', () => this.handleTrackEnd());
        audioElement.addEventListener('timeupdate', () => this.updateProgressBar());
        audioElement.addEventListener('loadedmetadata', () => this.updateDurationDisplay());

        this.initAudioContext();
        this.defineListeners();
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    updateDurationDisplay() {
        const audioElement = this.shadowRoot.querySelector('#myaudio');
        const durationDisplay = this.shadowRoot.querySelector('#durationDisplay');
        const progressBar = this.shadowRoot.querySelector('#progressBar');

        durationDisplay.innerText = this.formatTime(audioElement.duration);
        progressBar.max = audioElement.duration;
    }

    updateProgressBar() {
        // On ne met pas à jour si l'utilisateur est en train de cliquer/glisser
        if (this.isDraggingProgress) return;

        const audioElement = this.shadowRoot.querySelector('#myaudio');
        const progressBar = this.shadowRoot.querySelector('#progressBar');
        const currentTimeDisplay = this.shadowRoot.querySelector('#currentTimeDisplay');

        progressBar.value = audioElement.currentTime;
        currentTimeDisplay.innerText = this.formatTime(audioElement.currentTime);

        const percentage = (audioElement.currentTime / audioElement.duration) * 100 || 0;
        progressBar.style.background = `linear-gradient(to right, #f1c40f ${percentage}%, #555 ${percentage}%)`;
    }

    resizeCanvas() {
        const c1 = this.shadowRoot.querySelector('#spectrumCanvas');
        const c2 = this.shadowRoot.querySelector('#waveformCanvas');

        if(c1.clientWidth > 0) {
            c1.width = c1.clientWidth;
            c1.height = c1.clientHeight;
            c2.width = c2.clientWidth;
            c2.height = c2.clientHeight;
        }
    }

    renderPlaylist() {
        const container = this.shadowRoot.querySelector('#playlistTracks');
        container.innerHTML = '';

        this.playlist.forEach((track, index) => {
            const div = document.createElement('div');
            div.className = 'track-item';
            if(index === this.currentTrackIndex) div.classList.add('active');
            div.textContent = `${index + 1}. ${track.title}`;
            div.onclick = () => {
                this.currentTrackIndex = index;
                this.loadAndPlayTrack();
            };
            container.appendChild(div);
        });
    }

    loadAndPlayTrack() {
        const audioElement = this.shadowRoot.querySelector('#myaudio');
        audioElement.src = this.playlist[this.currentTrackIndex].url;

        this.shadowRoot.querySelector('#progressBar').value = 0;
        this.shadowRoot.querySelector('#progressBar').style.background = `#555`;

        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        audioElement.play().catch(e => console.log("Erreur play:", e));
        this.renderPlaylist();
    }

    handleTrackEnd() {
        if (this.loopMode === 1) {
            this.loadAndPlayTrack();
        } else {
            this.playNextTrack(true);
        }
    }

    playNextTrack(isAutoNext = false) {
        if (this.isShuffling) {
            let nextIdx = this.currentTrackIndex;
            while(nextIdx === this.currentTrackIndex && this.playlist.length > 1) {
                nextIdx = Math.floor(Math.random() * this.playlist.length);
            }
            this.currentTrackIndex = nextIdx;
        } else {
            if (isAutoNext && this.loopMode === 2 && this.currentTrackIndex === this.playlist.length - 1) {
                return;
            }
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        }
        this.loadAndPlayTrack();
    }

    playPrevTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadAndPlayTrack();
    }

    initAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            const audioElement = this.shadowRoot.querySelector('#myaudio');

            this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
            this.pannerNode = this.audioCtx.createStereoPanner();
            this.filterNode = this.audioCtx.createBiquadFilter();

            const freqs = [60, 170, 350, 1000, 3500, 10000];
            this.eqFilters = freqs.map(freq => {
                let eq = this.audioCtx.createBiquadFilter();
                eq.frequency.value = freq;
                eq.type = "peaking";
                eq.gain.value = 0;
                return eq;
            });

            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 1024;
            this.timeDataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.freqDataArray = new Uint8Array(this.analyser.frequencyBinCount);

            this.convolverNode = this.audioCtx.createConvolver();
            this.convolverGain = this.audioCtx.createGain();
            this.directGain = this.audioCtx.createGain();
            this.convolverGain.gain.value = 0;
            this.directGain.gain.value = 1;
            this.loadImpulse(this.impulseURL);

            this.sourceNode.connect(this.eqFilters[0]);
            for(let i = 0; i < this.eqFilters.length - 1; i++) {
                this.eqFilters[i].connect(this.eqFilters[i+1]);
            }
            this.eqFilters[this.eqFilters.length - 1].connect(this.filterNode);
            this.filterNode.connect(this.pannerNode);

            this.pannerNode.connect(this.directGain);
            this.pannerNode.connect(this.convolverNode);
            this.convolverNode.connect(this.convolverGain);

            this.directGain.connect(this.analyser);
            this.convolverGain.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);

            this.visualizeSpectrum();
            this.visualizeWaveform();
        }
    }

    async loadImpulse(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const decodedAudio = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.convolverNode.buffer = decodedAudio;
        } catch(e) { console.error(e); }
    }

    visualizeSpectrum() {
        if (!this.analyser) return;

        const canvas = this.shadowRoot.querySelector('#spectrumCanvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);

        this.analyser.getByteFrequencyData(this.freqDataArray);

        const barWidth = (width / 120);
        let x = 0;

        for(let i = 0; i < 120; i++) {
            let barHeight = (this.freqDataArray[i] / 255) * height;

            let r = barHeight + (25 * (i/120));
            let g = 250 * (i/120);
            let b = 150;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
        }

        requestAnimationFrame(() => this.visualizeSpectrum());
    }

    visualizeWaveform() {
        if (!this.analyser) return;

        const canvas = this.shadowRoot.querySelector('#waveformCanvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = 'rgba(17, 17, 17, 0.2)';
        ctx.fillRect(0, 0, width, height);

        this.analyser.getByteTimeDomainData(this.timeDataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff66b2';
        ctx.beginPath();

        let sliceWidth = width / this.analyser.frequencyBinCount;
        let x = 0;

        for(let i = 0; i < this.analyser.frequencyBinCount; i++) {
            let v = this.timeDataArray[i] / 128.0;
            let y = (v * height) / 2;

            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
        }

        ctx.lineTo(width, height/2);
        ctx.stroke();

        requestAnimationFrame(() => this.visualizeWaveform());
    }

    defineListeners() {
        const audioElement = this.shadowRoot.querySelector('#myaudio');

        const progressBar = this.shadowRoot.querySelector('#progressBar');
        const currentTimeDisplay = this.shadowRoot.querySelector('#currentTimeDisplay');

        progressBar.addEventListener('mousedown', () => { this.isDraggingProgress = true; });
        progressBar.addEventListener('mouseup', () => {
            this.isDraggingProgress = false;
            audioElement.currentTime = progressBar.value;
        });
        progressBar.addEventListener('input', (e) => {
            currentTimeDisplay.innerText = this.formatTime(e.target.value);
            const percentage = (e.target.value / audioElement.duration) * 100 || 0;
            progressBar.style.background = `linear-gradient(to right, #f1c40f ${percentage}%, #555 ${percentage}%)`;
        });

        this.shadowRoot.querySelector('#playButton').addEventListener('click', () => {
            if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
            audioElement.play();
        });
        this.shadowRoot.querySelector('#pauseButton').addEventListener('click', () => audioElement.pause());
        this.shadowRoot.querySelector('#nextButton').addEventListener('click', () => this.playNextTrack(false));
        this.shadowRoot.querySelector('#prevButton').addEventListener('click', () => this.playPrevTrack());

        const btnShuffle = this.shadowRoot.querySelector('#shuffleButton');
        btnShuffle.addEventListener('click', () => {
            this.isShuffling = !this.isShuffling;
            btnShuffle.classList.toggle('active-btn', this.isShuffling);
        });

        const btnLoop = this.shadowRoot.querySelector('#loopButton');
        const loopLabels = ['🔁 Loop All', '🔂 Loop One', '➡ No Loop'];
        btnLoop.addEventListener('click', () => {
            this.loopMode = (this.loopMode + 1) % 3;
            btnLoop.innerText = loopLabels[this.loopMode];
            btnLoop.classList.toggle('active-btn', this.loopMode !== 2);
        });
        btnLoop.classList.add('active-btn');

        this.shadowRoot.querySelector('#volumeKnob').addEventListener('input', (e) => audioElement.volume = e.target.value);
        this.shadowRoot.querySelector('#pannerSlider').addEventListener('input', (e) => {
            if(this.pannerNode) this.pannerNode.pan.value = e.target.value;
        });
        this.shadowRoot.querySelector('#convolverSlider').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if(this.convolverGain) {
                this.convolverGain.gain.value = val;
                this.directGain.gain.value = 1 - val;
            }
        });

        const eqSliders = this.shadowRoot.querySelectorAll('.eq-slider');
        eqSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const idx = e.target.getAttribute('data-idx');
                const val = parseFloat(e.target.value);
                if(this.eqFilters[idx]) this.eqFilters[idx].gain.value = val;
                this.shadowRoot.querySelector(`#gain${idx}`).innerText = val + " dB";
            });
        });

        const fSlider = this.shadowRoot.querySelector('#biquadFilterFrequencySlider');
        fSlider.oninput = (e) => {
            this.filterNode.frequency.value = e.target.value;
            const label = this.shadowRoot.querySelector('#freqLabel');
            if(label) label.innerText = `Freq: ${e.target.value} Hz`;
        };

        const dSlider = this.shadowRoot.querySelector('#biquadFilterDetuneSlider');
        dSlider.oninput = (e) => {
            this.filterNode.detune.value = e.target.value;
            const label = this.shadowRoot.querySelector('#detuneLabel');
            if(label) label.innerText = `Detune: ${e.target.value}`;
        };

        const qSlider = this.shadowRoot.querySelector('#biquadFilterQSlider');
        qSlider.oninput = (e) => {
            this.filterNode.Q.value = e.target.value;
            const label = this.shadowRoot.querySelector('#qLabel');
            if(label) label.innerText = `Q: ${e.target.value}`;
        };

        this.shadowRoot.querySelector('#biquadFilterTypeSelector').onchange = (e) => {
            this.filterNode.type = e.target.value;
        };
    }
}

customElements.define('my-audio-player', MyAudioPlayer);