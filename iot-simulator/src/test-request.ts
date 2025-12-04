import axios from 'axios';

const backendUrl = 'http://localhost:3001';

async function test() {
  const data = {
    train_id: '1000',
    lat: 12.9716,
    lng: 77.5946,
    speed_kmph: 0,
    heading: 0,
    accuracy: 5,
    device_id: 'DEVICE_001',
    battery_level: 100,
    signal_strength: -60,
    timestamp: new Date().toISOString(),
    source: 'test-script'
  };

  try {
    const response = await axios.post(`${backendUrl}/api/iot/location`, data);
    console.log('Success:', response.data);
  } catch (error: any) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response data:', JSON.stringify(error.response.data));
    }
  }
}

test();
