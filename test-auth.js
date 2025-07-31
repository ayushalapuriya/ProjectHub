const axios = require('axios');

const testAuth = async () => {
  try {
    console.log('Testing authentication...');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@projecthub.com',
      password: 'password123'
    });
    
    console.log('Login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    
    // Test getting user profile
    const profileResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile:', profileResponse.data);
    
    // Test getting projects
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Projects:', projectsResponse.data);
    
    // Test getting dashboard
    const dashboardResponse = await axios.get('http://localhost:5000/api/users/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Dashboard:', dashboardResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testAuth();
