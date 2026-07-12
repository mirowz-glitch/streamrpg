import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Sprint World Immersion Phase I — primeira coisa que qualquer jogador
// vê logo depois do login. "Autenticando..." lia como um dashboard
// confirmando uma sessão; a mesma espera, com a mesma duração, agora
// fala do Reino em vez do OAuth — reaproveita só o tom já estabelecido
// em WelcomeCard ("Bem-vindo ao Reino"), nenhum componente novo.
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/app/character", { replace: true });
  }, [navigate]);

  return (
    <main className="page">
      <div className="card city-square-view">Chegando ao Reino...</div>
    </main>
  );
}
