import { createContext } from 'react';

interface AuthContextType {
  logout: () => void;
  user: null;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  logout: () => {
    console.warn('logout called (mock)');
  },
  user: null,
  isLoggedIn: true,
});

export default AuthContext;
