import './App.css';
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Planner from "./pages/Planner";
import ShoppingList from "./pages/ShoppingList";
import AdminDashboard from "./pages/AdminPanel/AdminDashboard";

import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

const withFooter = (page) => (
  <>
    {page}
    <Footer />
  </>
);

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("route-enter");
  const user = JSON.parse(localStorage.getItem("user")); // obtener usuario logueado
  const locationChanged =
    location.pathname !== displayLocation.pathname ||
    location.search !== displayLocation.search;

  useEffect(() => {
    if (!locationChanged) return;

    const exitStart = setTimeout(() => {
      setTransitionStage("route-exit");
    }, 0);

    const routeSwap = setTimeout(() => {
      setDisplayLocation(location);
      setTransitionStage("route-enter");
    }, 140);

    return () => {
      clearTimeout(exitStart);
      clearTimeout(routeSwap);
    };
  }, [location, locationChanged]);

  useEffect(() => {
    if (transitionStage !== "route-enter") return;

    const timeout = setTimeout(() => {
      setTransitionStage("route-idle");
    }, 240);

    return () => clearTimeout(timeout);
  }, [transitionStage, displayLocation]);

  return (
    <div className={`route-transition ${transitionStage}`}>
      <Routes location={displayLocation}>
        <Route path="/" element={withFooter(<Home />)} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {withFooter(<Profile />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              {withFooter(<Recipes />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              {withFooter(<RecipeDetail />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              {withFooter(<Planner />)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/shopping-list"
          element={
            <ProtectedRoute>
              {withFooter(<ShoppingList />)}
            </ProtectedRoute>
          }
        />

        {/* Panel administrativo solo accesible a usuarios con rol "administrador" */}
        <Route
          path="/admin/recipes"
          element={
            user?.rol === "administrador" ? (
              <ProtectedRoute>
                {withFooter(<AdminDashboard />)}
              </ProtectedRoute>
            ) : (
              <Navigate to="/profile" replace /> // redirige si no es admin
            )
          }
        />
        
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
