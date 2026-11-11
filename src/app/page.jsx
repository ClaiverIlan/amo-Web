"use client";

import "./page.css";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import { useAuth } from "@/context/auth";

import Input from "@/components/input";

import VerticalLine from "@/components/verticalLine";

import About from "@/components/about";

import Title from "@/components/title";

import SubTitle from "@/components/subLink";

import DefaultButton from "@/components/DefaultButton";

export default function Home() {
  const router = useRouter();

  const { Login, IsConnected } = useAuth();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const [userLogin, setUserLogin] = useState({
    email: "",
    password: "",
  });

  // Estados para controlar erros individuais nos inputs
  const [inputErrors, setInputErrors] = useState({
    email: false,
    password: false,
  });

  // Verificar se o usuário já está logado
  useEffect(() => {
    const checkUserAuth = async () => {
      // Evitar múltiplas verificações
      if (hasCheckedAuth) return;

      try {
        console.log("🔍 Verificando autenticação...");

        // Timeout para evitar travamento
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        );

        const isConnected = await Promise.race([
          IsConnected(),
          timeoutPromise,
        ]);

        console.log("📊 Status de conexão:", isConnected);

        if (isConnected === true) {
          // Usuário está logado e com perfil completo
          console.log(
            "✅ Usuário logado, redirecionando para SelectDiscipline"
          );

          router.replace("/SelectDiscipline");

          return;
        } else if (isConnected === null) {
          // Usuário está logado mas com perfil incompleto
          console.log(
            "⚠️ Perfil incompleto, redirecionando para CompleteRegister"
          );

          router.replace("/ProfilePicture");

          return;
        }

        // Se isConnected === false, usuário não está logado,
        // continua na página de login
        console.log(
          "❌ Usuário não logado, permanecendo na tela de login"
        );
      } catch (error) {
        console.error("❌ Erro ao verificar autenticação:", error);
      } finally {
        setHasCheckedAuth(true);
        setCheckingAuth(false);
      }
    };

    checkUserAuth();
  }, [router, hasCheckedAuth, IsConnected]);

  const handleRegisterClick = () => {
    console.log("Navegando para a página de registro...");
    router.push("/Register");
  };

  const handleInputChange = (field, value) => {
    setUserLogin((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpa o erro quando o usuário começa a digitar
    if (error) setError("");

    // Limpa o erro visual do input específico
    setInputErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const login = async () => {
    // Validação básica
    if (!userLogin.email || !userLogin.password) {
      setError("Por favor, preencha todos os campos");

      // Marca os campos vazios como erro
      setInputErrors({
        email: !userLogin.email,
        password: !userLogin.password,
      });

      return;
    }

    setLoading(true);
    setError("");

    // Limpa os erros visuais dos inputs ao tentar fazer login novamente
    setInputErrors({
      email: false,
      password: false,
    });

    try {
      console.log("🔐 Iniciando login...");

      const result = await Login({
        email: userLogin.email,
        password: userLogin.password,
      });

      console.log("🔍 Resultado do login:", result);

      if (result?.erro) {
        setError(result.erro);

        console.error("Erro no login:", result.erro);

        // Se for erro de dados inválidos (400) ou credenciais incorretas (401),
        // marca os inputs como erro
        if (
          result.erro ===
            "Dados inválidos. Verifique o email e senha." ||
          result.erro ===
            "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
        ) {
          setInputErrors({
            email: true,
            password: true,
          });
        }

        return;
      }

      if (result && result.erro === "usuario incompleto!") {
        console.log(
          "✅ Login realizado! Redirecionando para completar cadastro..."
        );

        router.push("/ProfilePicture");

        return;
      }

      // Se chegou até aqui, login foi bem-sucedido
      console.log("✅ Login realizado com sucesso!");

      router.push("/SelectDiscipline");
    } catch (err) {
      console.error("Erro durante o login:", err);

      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (checkingAuth) {
    return (
      <div className="container-border">
        <div className="page">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              fontSize: "18px",
            }}
          >
            Verificando autenticação...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-border">
      <div className="page">
        <div className="left-area">
          <Title title="LOGIN" />

          <Input
            placeholder="EMAIL"
            value={userLogin.email}
            onChange={(value) =>
              handleInputChange("email", value)
            }
            type="email"
            error={inputErrors.email}
          />

          <Input
            placeholder="SENHA"
            value={userLogin.password}
            onChange={(value) =>
              handleInputChange("password", value)
            }
            type="password"
            error={inputErrors.password}
          />

          {error && (
            <div
              style={{
                color: "red",
                fontSize: "14px",
                margin: "10px 0",
              }}
            >
              {error}
            </div>
          )}

          <SubTitle subtitle="ESQUECI MINHA SENHA" />

          <DefaultButton onClick={login} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </DefaultButton>

          <SubTitle
            subtitle="NÃO POSSUO CADASTRO"
            onClick={handleRegisterClick}
          />
        </div>

        <VerticalLine />

        <div className="right-area">
          <About />
        </div>
      </div>
    </div>
  );
}