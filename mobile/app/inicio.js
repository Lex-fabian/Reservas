import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { authService } from '../services/api';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const loggedIn = await authService.isLoggedIn();
    setIsLoggedIn(loggedIn);
  };

  if (isLoggedIn === null) {
    return null; // Mostrar splash screen
  }

  return <Redirect href={isLoggedIn ? "/(tabs)/areas" : "/login"} />;
}
