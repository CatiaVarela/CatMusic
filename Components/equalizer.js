class MyEqualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            .eq-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid #ffba84; color: white; }
            .slider-item { display: flex; flex-direction: column; }
            label { font-size: 0.9em; margin-bottom: 5px; display: flex; justify-content: space-between;}
            input[type=range] { width: 100%; cursor: pointer; }
        </style>
        <div class="eq-grid">
            <div style="grid-column: span 6; text-align: center; font-weight: bold; color: #ffba84; margin-bottom: 10px;">Equalizer 6-Bandes</div>
            ${[60, 170, 350, 1000, 3500, 10000].map((freq, i) => `
                <div class="slider-item">
                    <label>${freq < 1000 ? freq+'Hz' : (freq/1000)+'KHz'} <span id="gain${i}">0 dB</span></label>
                    <input type="range" class="eq-slider" data-idx="${i}" min="-30" max="30" value="0" />
                </div>
            `).join('')}
        </div>`;

        this.shadowRoot.querySelectorAll('.eq-slider').forEach(slider => {
            slider.oninput = (e) => {
                const idx = e.target.dataset.idx;
                const val = e.target.value;
                this.shadowRoot.querySelector(`#gain${idx}`).innerText = val + " dB";
                this.dispatchEvent(new CustomEvent('eq-change', { detail: { idx, val } }));
            };
        });
    }
}
customElements.define('my-equalizer', MyEqualizer);