import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Inicio from './pages/Inicio';

function PrivateRoute({ children }) {
  const isAuthorized = authService.isLoggedIn() && authService.isAdminOrSuper();
  return isAuthorized ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const isAuthorized = authService.isLoggedIn() && authService.isAdminOrSuper();
  return isAuthorized ? <Navigate to="/inicio" /> : children;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/"
          element={
            authService.isLoggedIn() && authService.isAdminOrSuper() ? (
              <Navigate to="/inicio" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <Inicio />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
