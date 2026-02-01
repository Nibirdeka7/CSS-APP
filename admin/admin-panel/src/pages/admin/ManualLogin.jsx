import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManualLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // The exact same body you use in Postman
  const manualData = {
    googleId: "123456",
    email: "abc@cse.nits.ac.in",
    name: "Nibir Deka",
    profilePicture: "abc"
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://css-app-mfog.vercel.app/api/auth/google', manualData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert("Success! Token saved to mobile storage.");
        navigate('/admin');
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>NITS CSE Admin Bypass</h2>
      <p>Click below to simulate login for <b>{manualData.email}</b></p>
      <button 
        onClick={handleLogin} 
        disabled={loading}
        style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer' }}
      >
        {loading ? 'Logging in...' : 'Login & Save Token'}
      </button>
    </div>
  );
};

export default ManualLogin;