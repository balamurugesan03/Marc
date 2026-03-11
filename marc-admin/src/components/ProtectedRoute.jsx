import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>👔</div>
          <p style={{ marginTop: 8, color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return admin ? children : <Navigate to="/login" replace />;
}
