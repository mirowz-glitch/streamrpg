import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/app/character", { replace: true });
  }, [navigate]);

  return (
    <main className="page">
      <div className="card">Autenticando...</div>
    </main>
  );
}
