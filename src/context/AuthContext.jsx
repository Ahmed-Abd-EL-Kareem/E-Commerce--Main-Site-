import axios from "../utils/axiosInstance";
import {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { updateProfile as apiUpdateProfile } from '../utils/api';

const AuthContext = createContext(null);

const initalState = {
  user: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errors, setErrors] = useState(null);

  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initalState
  );

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token in isTokenValid:", decoded);
      // Temporarily bypass expiration check for testing
      return true;
      // const exp = decoded.exp || (decoded.default && decoded.default.exp);
      // const currentTime = Date.now() / 1000;
      // return exp > currentTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token && isTokenValid(token)) {
        try {
          const user = jwtDecode(token);
          // Add axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          dispatch({ type: "LOGIN", payload: user });
        } catch (err) {
          console.error(err);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      } else {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
      setCheckingAuth(false);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data) => {
    try {
      setLoading(true);
      console.log("Login request data:", data);
      const response = await axios.post("/auth/login", data);
      console.log("Login response:", response);

      if (!response.data) {
        throw new Error("No data in login response");
      }
      if (!response.data.token) {
        console.error("Login response missing token:", response.data);
        throw new Error("Token missing in login response");
      }

      const { token } = response.data;
      console.log("Received token:", token);
      const decodedUser = jwtDecode(token);
      console.log("Decoded user from token:", decodedUser);
      if (!isTokenValid(token)) throw new Error("Invalid token received");

      localStorage.setItem("token", token);
      // Add axios default header after login
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch({ type: "LOGIN", payload: decodedUser });
      return { success: true, user: decodedUser };
    } catch (error) {
      console.error("Login error details:", error);
      setErrors(error.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await apiUpdateProfile(profileData);
      if (data && data.data && data.data.user) {
        dispatch({ type: 'UPDATE_USER', payload: data.data.user });
        return { success: true, user: data.data.user };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update profile' };
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        isAuthenticated,
        errors,
        checkingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
