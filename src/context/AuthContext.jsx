import React, { createContext, useState, useContext } from 'react';
import { USERS as INITIAL_USERS, GRADES as INITIAL_GRADES } from '../data/MockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users] = useState(INITIAL_USERS);
  const [grades] = useState(INITIAL_GRADES);

  const login = (identifier, password) => {
    const foundUser = users.find((u) => {
      const input = identifier.toString().toLowerCase();
      return (u.email.toLowerCase() === input || u.id.toString() === input) && u.password === password;
    });
    if (foundUser) { setUser(foundUser); return true; }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, users, grades, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);