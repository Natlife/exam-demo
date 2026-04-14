// Mock useAuth - no real authentication needed for demo
export default function useAuth() {
  return {
    logout: () => {
      console.warn('logout called (mock - no real auth)');
    },
    user: null,
    isLoggedIn: true,
  };
}
