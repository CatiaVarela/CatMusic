import "./equalizer.js";
import "./visualizer.js";
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

    .slider-item { display: flex; flex-direction: column; }
    label { font-size: 0.9em; margin-bottom: 5px; display: flex; justify-content: space-between;}
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
        <my-visualizer id="viz"></my-visualizer>
        
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

        <my-equalizer id="eq-component"></my-equalizer>

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
        this.eqFilters = [];
        this.isDraggingProgress = false;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = style + html;

        const audioElement = this.shadowRoot.querySelector('#myaudio');
        audioElement.src = this.playlist[this.currentTrackIndex].url;

        this.initAudioContext();

        // Communication avec l'égaliseur
        this.shadowRoot.querySelector('#eq-component').addEventListener('eq-change', (e) => {
            const { idx, val } = e.detail;
            if(this.eqFilters[idx]) this.eqFilters[idx].gain.value = val;
        });

        // Communication avec le visualiseur
        const viz = this.shadowRoot.querySelector('#viz');
        viz.analyser = this.analyser;

        this.renderPlaylist();
        this.defineListeners();

        audioElement.addEventListener('ended', () => this.handleTrackEnd());
        audioElement.addEventListener('timeupdate', () => this.updateProgressBar());
        audioElement.addEventListener('loadedmetadata', () => this.updateDurationDisplay());
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
        if (this.isDraggingProgress) return;
        const audioElement = this.shadowRoot.querySelector('#myaudio');
        const progressBar = this.shadowRoot.querySelector('#progressBar');
        const currentTimeDisplay = this.shadowRoot.querySelector('#currentTimeDisplay');
        progressBar.value = audioElement.currentTime;
        currentTimeDisplay.innerText = this.formatTime(audioElement.currentTime);
        const percentage = (audioElement.currentTime / audioElement.duration) * 100 || 0;
        progressBar.style.background = `linear-gradient(to right, #f1c40f ${percentage}%, #555 ${percentage}%)`;
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
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
        audioElement.play();
        this.renderPlaylist();
    }

    handleTrackEnd() {
        if (this.loopMode === 1) this.loadAndPlayTrack();
        else this.playNextTrack(true);
    }

    playNextTrack(isAutoNext = false) {
        if (this.isShuffling) {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            if (isAutoNext && this.loopMode === 2 && this.currentTrackIndex === this.playlist.length - 1) return;
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        }
        this.loadAndPlayTrack();
    }

    playPrevTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadAndPlayTrack();
    }

    defineListeners() {
        const audioElement = this.shadowRoot.querySelector('#myaudio');
        const progressBar = this.shadowRoot.querySelector('#progressBar');

        progressBar.addEventListener('mousedown', () => { this.isDraggingProgress = true; });
        progressBar.addEventListener('mouseup', () => {
            this.isDraggingProgress = false;
            audioElement.currentTime = progressBar.value;
        });

        this.shadowRoot.querySelector('#playButton').onclick = () => {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            audioElement.play();
        };
        this.shadowRoot.querySelector('#pauseButton').onclick = () => audioElement.pause();
        this.shadowRoot.querySelector('#nextButton').onclick = () => this.playNextTrack(false);
        this.shadowRoot.querySelector('#prevButton').onclick = () => this.playPrevTrack();

        this.shadowRoot.querySelector('#volumeKnob').oninput = (e) => audioElement.volume = e.target.value;
        this.shadowRoot.querySelector('#pannerSlider').oninput = (e) => this.pannerNode.pan.value = e.target.value;
        this.shadowRoot.querySelector('#convolverSlider').oninput = (e) => {
            const val = parseFloat(e.target.value);
            this.convolverGain.gain.value = val;
            this.directGain.gain.value = 1 - val;
        };

        const fSlider = this.shadowRoot.querySelector('#biquadFilterFrequencySlider');
        fSlider.oninput = (e) => {
            this.filterNode.frequency.value = e.target.value;
            this.shadowRoot.querySelector('#freqLabel').innerText = `Freq: ${e.target.value} Hz`;
        };

        this.shadowRoot.querySelector('#biquadFilterTypeSelector').onchange = (e) => this.filterNode.type = e.target.value;
    }
}

customElements.define('my-audio-player', MyAudioPlayer);