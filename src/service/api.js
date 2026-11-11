import axios from "axios";

const api = axios.create({
  baseURL: "/api/backend/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 10000,
});

// Interceptador de requisição para adicionar token automaticamente
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Token ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratamento global de erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 significa que o usuário não está autenticado.
    // Isso é esperado na tela de login, então não tratamos como erro do sistema.
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }

      return Promise.reject(error);
    }

    console.error("Erro na API:", error);

    // Tratamento específico para erros de CORS/rede
    if (
      error.code === "ERR_NETWORK" ||
      error.message?.includes("CORS")
    ) {
      console.error("Erro de conexão com o servidor.");
    }

    return Promise.reject(error);
  }
);

export default api;