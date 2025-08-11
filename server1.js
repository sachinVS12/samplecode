const mqtt = require('mqtt');

class MQTTPublisher {
    constructor(broker, topics) {
        this.broker = broker;
        this.topics = Array.isArray(topics) ? topics : [topics];
        this.count = 1;

        // Frequency sweep setup
        this.freq_min = 500;
        this.freq_max = 900;
        this.frequency = this.freq_min;
        this.freq_direction = 1; // 1 = increasing, -1 = decreasing
        this.freq_step = 50; // Hz per message

        // Waveform setup
        const amp = 2;
        this.amplitude = ((amp * 0.5) / (3.3 / 65535));
        this.offset = 32768;

        this.sample_rate = 4096;
        this.time_per_message = 1.0;
        this.current_time = 0.0;

        this.channel = 12; // Total: 4 main + 2 tacho
        this.main_channels = 10;
        this.frame_index = 0;
        this.timer = null;

        this.client = mqtt.connect(`mqtt://${broker}`, {
            reconnectPeriod: 1000,
            connectTimeout: 5000
        });

        this.client.on('connect', () => {
            console.log(`${new Date().toISOString()} - INFO - Connected to MQTT broker: ${broker}`);
            if (!this.timer) {
                this.timer = setInterval(() => this.publishMessage(), 1000);
                console.log(`${new Date().toISOString()} - INFO - Publishing started`);
            }
        });

        this.client.on('reconnect', () => {
            console.log(`${new Date().toISOString()} - INFO - Retrying connection to MQTT broker: ${broker}`);
        });

        this.client.on('error', (err) => {
            console.error(`${new Date().toISOString()} - ERROR - MQTT connection error: ${err.message}`);
        });

        this.client.on('close', () => {
            console.log(`${new Date().toISOString()} - INFO - Disconnected from MQTT broker: ${broker}`);
        });
    }

    publishMessage() {
        if (!this.client.connected) {
            console.log(`${new Date().toISOString()} - WARN - Cannot publish: MQTT client not connected`);
            return;
        }

        if (this.count >= 20000) {
            clearInterval(this.timer);
            this.timer = null;
            console.log(`${new Date().toISOString()} - INFO - Publishing stopped after 20000 messages`);
            this.client.end();
            return;
        }

        // Sweep frequency
      this.frequency += this.freq_step;
if (this.frequency > this.freq_max) {
    this.frequency = this.freq_min;
}


        const samples_per_channel = this.sample_rate;
        const all_channel_data = new Array(this.channel).fill().map(() => new Array(samples_per_channel).fill(0));

        for (let i = 0; i < samples_per_channel; i++) {
            const t = this.current_time + (i / this.sample_rate);
            const base_value = this.offset + this.amplitude * Math.sin(2 * Math.PI * this.frequency * t);
            const rounded_value = Math.round(base_value);
            for (let ch = 0; ch < this.main_channels; ch++) {
                all_channel_data[ch][i] = rounded_value;
            }
        }

        // Add frequency and tacho signal channels
        for (let i = 0; i < samples_per_channel; i++) {
            all_channel_data[this.channel - 2][i] = Math.round(this.frequency);
        }

        const interval = this.sample_rate / this.frequency;
        for (let i = 0; i < samples_per_channel; i++) {
            all_channel_data[this.channel - 1][i] = (i % Math.round(interval) === 0) ? 1 : 0;
        }

        this.current_time += this.time_per_message;

        const header = [
            this.frame_index % 65535,
            Math.floor(this.frame_index / 65535),
            this.main_channels,
            this.sample_rate,
            16,
            this.sample_rate,
            2,
            0,
            0,
            0
        ];

        const interleaved_main = [];
        for (let i = 0; i < samples_per_channel; i++) {
            for (let ch = 0; ch < this.main_channels; ch++) {
                interleaved_main.push(all_channel_data[ch][i]);
            }
        }

        const message_values = [
            ...header,
            ...interleaved_main,
            ...all_channel_data[this.channel - 2],
            ...all_channel_data[this.channel - 1]
        ];

        const buffer = Buffer.alloc(message_values.length * 2);
        for (let i = 0; i < message_values.length; i++) {
            buffer.writeUInt16LE(message_values[i], i * 2);
        }

        for (const topic of this.topics) {
            try {
                this.client.publish(topic, buffer, { qos: 1 }, (err) => {
                    if (err) {
                        console.error(`${new Date().toISOString()} - ERROR - Failed to publish to ${topic}: ${err.message}`);
                    } else {
                        console.log(`${new Date().toISOString()} - INFO - [${this.count}] Published to ${topic}: frame ${this.frame_index}, freq: ${Math.round(this.frequency)} Hz`);
                    }
                });
            } catch (e) {
                console.error(`${new Date().toISOString()} - ERROR - Failed to publish to ${topic}: ${e.message}`);
            }
        }

        this.frame_index++;
        this.count++;
    }
}

// Run if this file is executed directly
if (require.main === module) {
    const broker = '192.168.1.231'; // Change to your broker IP
    const topics = ['sarayu/d1/topic1']; // Change to your desired MQTT topic(s)
    new MQTTPublisher(broker, topics);
}
