export class NoiseGenerator {
    constructor(context, duration = 10) {
        this.context = context;
        this.bufferSize = context.sampleRate * duration;
    }

    createNoiseBuffer(type) {
        const sampleRate = this.context.sampleRate;
        const mainSamples = this.bufferSize;
        const crossSamples = Math.floor(sampleRate * 1.0);
        const totalSamples = mainSamples + crossSamples;
        const tempBuffer = new Float32Array(totalSamples);

        switch (type) {
            case 'white': this.fillWhiteNoise(tempBuffer); break;
            case 'pink': this.fillPinkNoise(tempBuffer); break;
            case 'brown': this.fillBrownNoise(tempBuffer); break;
            case 'blue': this.fillBlueNoise(tempBuffer); break;
            case 'violet': this.fillVioletNoise(tempBuffer); break;
        }

        const finalBuffer = this.context.createBuffer(1, mainSamples, sampleRate);
        const finalData = finalBuffer.getChannelData(0);

        for (let i = 0; i < mainSamples; i++) {
            if (i < crossSamples) {
                const alpha = i / crossSamples;
                const gainIn = Math.sqrt(alpha);
                const gainOut = Math.sqrt(1 - alpha);
                finalData[i] = (tempBuffer[i] * gainIn) + (tempBuffer[mainSamples + i] * gainOut);
            } else {
                finalData[i] = tempBuffer[i];
            }
        }
        return finalBuffer;
    }

    createSource(type) {
        const buffer = this.createNoiseBuffer(type);
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
    }

    fillWhiteNoise(data) {
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }

    fillPinkNoise(data) {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    }

    fillBrownNoise(data) {
        let lastOut = 0.0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
        }
    }

    fillBlueNoise(data) {
        let prev = 0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (white - prev) * 0.5;
            prev = white;
        }
    }

    fillVioletNoise(data) {
        let prev1 = 0, prev2 = 0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (white - 2 * prev1 + prev2) * 0.35;
            prev2 = prev1;
            prev1 = white;
        }
    }
}
