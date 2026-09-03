import React, { useEffect, useState, useContext } from "react";

const AuthContext = React.createContext();

const getStoredUser = () => {
  try {
    const localUser = localStorage.getItem("EDUTECH USER");
    if (localUser) return JSON.parse(localUser);

    const sessionUser = sessionStorage.getItem("EDUTECH USER");
    if (sessionUser) return JSON.parse(sessionUser);
  } catch (error) {
    console.error("Failed to parse stored user:", error);
  }

  return null;
};

export const AuthProvider = (props) => {
  const [user, setUser] = useState(getStoredUser());
  const [isLogin, setIsLogin] = useState(!!user);
  const [role, setRole] = useState(user?.role || "");

  // const logout = () => {
  //   setUser(null);
  //   setIsLogin(false);
  //   setRole("");
  //   localStorage.removeItem("EDUTECH USER");
  //   sessionStorage.removeItem("EDUTECH USER");
  // };

  useEffect(() => {
    setIsLogin(!!user);
    setRole(user?.role || "");
  }, [user]);

  const logout = () => {
    // Clear stored user
    localStorage.removeItem("EDUTECH USER");
    sessionStorage.removeItem("EDUTECH USER");

    // Clear React state
    setUser(null);
    setIsLogin(false);
    setRole("");
  };

  const value = { user, setUser, isLogin, setIsLogin, role, setRole, logout };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
