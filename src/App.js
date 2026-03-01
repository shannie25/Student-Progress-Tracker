import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
  
      <header className="app-header">
        <h1>Student's Performance Tracker</h1>
      </header>

  
      <div className="main-content">
        <div className="left-side">
   
        </div>

        <div className="right-side">
          <div className="login-container">
            <h2>Login to your Account</h2>
            <form>
              <div className="form-group">
                <label htmlFor="idNumber">ID Number</label>
                <input type="text" id="idNumber" placeholder="Enter your ID number" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" />
              </div>

              <div className="form-options">
                <label>
                  <input type="checkbox" /> Remember Me
                </label>
                <button type="button" className="forgot-btn">Forgot Password?</button>
              </div>

              <div className="form-buttons">
                <button type="submit" className="login-btn">LOGIN</button>
                <button type="button" className="register-btn">REGISTER</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;