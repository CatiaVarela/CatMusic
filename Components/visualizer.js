class MyVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._analyser = null;
    }

    set analyser(node) {
        this._analyser = node;
        this.start();
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            canvas {
                background-color: #111;
                border: 1px solid #333;
                border-radius: 5px;
                width: 100%;
            }
            #spectrumCanvas { height: 180px; }
            #waveformCanvas { height: 100px; margin-top: -10px; }
        </style>
        <canvas id="spectrumCanvas"></canvas>
        <canvas id="waveformCanvas"></canvas>
        `;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const c1 = this.shadowRoot.querySelector('#spectrumCanvas');
        const c2 = this.shadowRoot.querySelector('#waveformCanvas');
        if (c1.clientWidth > 0) {
            c1.width = c1.clientWidth; c1.height = c1.clientHeight;
            c2.width = c2.clientWidth; c2.height = c2.clientHeight;
        }
    }

    start() {
        const freqData = new Uint8Array(this._analyser.frequencyBinCount);
        const timeData = new Uint8Array(this._analyser.frequencyBinCount);

        const draw = () => {
            this.drawSpectrum(freqData);
            this.drawWaveform(timeData);
            requestAnimationFrame(draw);
        };
        draw();
    }

    drawSpectrum(data) {
        const canvas = this.shadowRoot.querySelector('#spectrumCanvas');
        const ctx = canvas.getContext('2d');
        this._analyser.getByteFrequencyData(data);
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / 120);
        let x = 0;
        for(let i = 0; i < 120; i++) {
            let barHeight = (data[i] / 255) * canvas.height;
            ctx.fillStyle = `rgb(${barHeight + (25 * (i/120))},${250 * (i/120)},150)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
    }

    drawWaveform(data) {
        const canvas = this.shadowRoot.querySelector('#waveformCanvas');
        const ctx = canvas.getContext('2d');
        this._analyser.getByteTimeDomainData(data);
        ctx.fillStyle = 'rgba(17, 17, 17, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff66b2';
        ctx.beginPath();
        let sliceWidth = canvas.width / this._analyser.frequencyBinCount;
        let x = 0;
        for(let i = 0; i < this._analyser.frequencyBinCount; i++) {
            let v = data[i] / 128.0;
            let y = (v * canvas.height) / 2;
            if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
    }
}
customElements.define('my-visualizer', MyVisualizer);