import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Planner from "./pages/Planner";
import ShoppingList from "./pages/ShoppingList";
import AdminDashboard from "./pages/AdminPanel/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const user = JSON.parse(localStorage.getItem("user")); // obtener usuario logueado

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shopping-list"
          element={
            <ProtectedRoute>
              <ShoppingList />
            </ProtectedRoute>
          }
        />

        {/* Panel administrativo solo accesible a usuarios con rol "administrador" */}
        <Route
          path="/admin/recipes"
          element={
            user?.rol === "administrador" ? (
              <ProtectedRoute>
              <AdminDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to="/profile" replace /> // redirige si no es admin
            )
          }
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;