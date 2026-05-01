import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  isAdmin: false,
  isBusiness: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      setUser(JSON.parse(stored));
      // Refresh user data in background
      authService
        .getMe()
        .then(({ data }) => {
          const fresh = data.data || data.user;
          if (fresh) {
            setUser(fresh);
            localStorage.setItem("user", JSON.stringify(fresh));
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    const { token, user: newUser } = data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const register = async (credentials) => {
    const { data } = await authService.register(credentials);
    const { token, user: newUser } = data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authService.logout?.().catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
        isBusiness: user?.role === "business",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
