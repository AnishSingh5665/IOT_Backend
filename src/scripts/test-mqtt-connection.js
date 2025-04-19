const mqtt = require('mqtt');

const brokers = [
    {
        name: 'HiveMQ',
        url: 'mqtt://broker.hivemq.com:1883',
        options: {}
    },
    {
        name: 'Mosquitto',
        url: 'mqtt://test.mosquitto.org:1883',
        options: {}
    },
    {
        name: 'Eclipse',
        url: 'mqtt://mqtt.eclipseprojects.io:1883',
        options: {}
    }
];

async function testBroker(broker) {
    return new Promise((resolve) => {
        console.log(`\nTesting connection to ${broker.name}...`);
        
        const client = mqtt.connect(broker.url, broker.options);
        
        client.on('connect', () => {
            console.log(`✅ Connected to ${broker.name}`);
            client.end();
            resolve(true);
        });
        
        client.on('error', (error) => {
            console.log(`❌ Error connecting to ${broker.name}:`, error.message);
            client.end();
            resolve(false);
        });
        
        // Set timeout
        setTimeout(() => {
            console.log(`❌ Timeout connecting to ${broker.name}`);
            client.end();
            resolve(false);
        }, 5000);
    });
}

async function testAllBrokers() {
    console.log('Starting MQTT broker connection tests...');
    
    for (const broker of brokers) {
        const success = await testBroker(broker);
        if (success) {
            console.log(`\n✅ ${broker.name} is working! Use this configuration in your .env file:`);
            console.log(`MQTT_BROKER_URL=${broker.url}`);
            console.log(`MQTT_USERNAME=`);
            console.log(`MQTT_PASSWORD=`);
            process.exit(0);
        }
    }
    
    console.log('\n❌ No working MQTT brokers found. Please try:');
    console.log('1. Check your internet connection');
    console.log('2. Try a different network');
    console.log('3. Contact your network administrator');
    process.exit(1);
}

testAllBrokers(); 