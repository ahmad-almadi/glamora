// Simple test to verify routes work locally
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testRoutes() {
  console.log('Testing routes...\n');

  // Test 1: Health check
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', res.data);
  } catch (err) {
    console.log('❌ Health check failed:', err.message);
  }

  // Test 2: Signup
  try {
    const res = await axios.post(`${BASE_URL}/signup`, {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'test123'
    });
    console.log('✅ Signup:', res.status, res.data.message);
  } catch (err) {
    console.log('❌ Signup failed:', err.response?.status, err.response?.data || err.message);
  }

  // Test 3: Google auth (will fail without valid Google token, but should not be 405)
  try {
    const res = await axios.post(`${BASE_URL}/google`, {
      email: 'test@gmail.com',
      name: 'Test User',
      googleId: '123456'
    });
    console.log('✅ Google auth:', res.status, res.data.message);
  } catch (err) {
    if (err.response?.status === 405) {
      console.log('❌ Google auth: 405 Method Not Allowed - ROUTE ISSUE!');
    } else {
      console.log('✅ Google auth route exists (error is expected):', err.response?.status);
    }
  }

  // Test 4: Products
  try {
    const res = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products:', res.status, `${res.data.length} products`);
  } catch (err) {
    console.log('❌ Products failed:', err.response?.status, err.response?.data || err.message);
  }
}

testRoutes();
