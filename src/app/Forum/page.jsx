"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Removido FaSearch e FaUserCircle daqui, pois serão passados como children para ForumHeader

import Sidebar from "@/components/SideBar";
import Card from "@/components/Card";
import FloatingButton from "@/components/FloatingButton";
import RegisterDoubt from "@/components/RegisterDoubt";
import AnswerQuestions from "@/components/AnswerQuestions";
import api from "@/service/api";
import { useAuth } from "@/context/auth";
import { useSubject } from "@/context/subject";
import { useToast } from "@/context/toast";
import { GetLoginToken } from "@/util/StorageLogin";
import ForumHeader from "@/components/ForumHeader";
import { FaUserCircle } from "react-icons/fa";
import styles from "./page.module.css";
import perfil from "../../../assets/perfil.png";

export default function Forum() {
  const [filters, setFilters] = useState({
    recent: true,
    responded: false,
    mostLiked: false,
    text: "",
  });

  const [confirmDeleteQuest, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const [reportQuestion, setReportQuestion] = useState({
    open: false,
    id: null,
    reason: "",
    description: "",
  });

  const [page, setPage] = useState(1);
  const [displayValue, setDisplayValue] = useState("");
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshQuestions, setRefreshQuestions] = useState(0);

  const { showSuccess, showError, showWarning } = useToast();

  const { subject, isLoaded } = useSubject();

  // Função para formatar data no padrão brasileiro
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Sem data") return "Sem data";

    try {
      const date = new Date(dateString);

      const months = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ];

      const day = date.getDate().toString().padStart(2, "0");
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${day} de ${month} de ${year}`;
    } catch (error) {
      return "Data inválida";
    }
  };

  useEffect(() => {
    if (!isLoaded || !subject || !subject.id) return;

    const GetQuestions = async () => {
      try {
        setLoading(true);

        let url = `/duvidas/?page=${page}&disciplina_id=${subject.id}`;

        if (filters.recent) {
          url += "&ordering=-data";
        } else if (filters.responded) {
          url += "&respondida=true";
        } else if (filters.mostLiked) {
          url += "&ordering=-votos";
        }

        const response = await api.get(url, {
          headers: {
            Authorization: "Token " + (await GetLoginToken()),
          },
        });

        setOriginalData(response.data);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    GetQuestions();
  }, [
    filters.responded,
    filters.mostLiked,
    filters.recent,
    subject,
    isLoaded,
    page,
    refreshQuestions,
  ]);

  const DeleteQuestion = async () => {
    try {
      await api.delete(`/duvidas/${confirmDeleteQuest.id}/`, {
        headers: {
          Authorization: "Token " + (await GetLoginToken()),
        },
      });

      setConfirmDelete({ open: false, id: null });

      // Remove a dúvida dos dados originais
      const updatedOriginalResults = originalData.results.filter(
        (item) => item.id !== confirmDeleteQuest.id
      );

      const newOriginalData = {
        ...originalData,
        results: updatedOriginalResults,
      };

      setOriginalData(newOriginalData);

      // Remove a dúvida dos dados filtrados
      const updatedFilteredResults = data.results.filter(
        (item) => item.id !== confirmDeleteQuest.id
      );

      setData({ ...data, results: updatedFilteredResults });
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleReportQuestion = async () => {
    try {
      if (!reportQuestion.reason) {
        showWarning("Erro", "Selecione um motivo");
        return;
      }

      const report = {
        reason: reportQuestion.reason,
        descricao: reportQuestion.description,
        disciplina: subject.id,
      };

      await api.post(
        `/duvidas/${reportQuestion.id}/report-duvida/`,
        report,
        {
          headers: {
            Authorization: "Token " + (await GetLoginToken()),
          },
        }
      );

      setReportQuestion({ open: false, id: null });

      showSuccess("Sucesso", "Reportado com sucesso!");
    } catch (error) {
      showError("Erro", "Tente novamente mais tarde");
      console.log(error.response);
    }
  };

  const handleLikeButton = (id) => {
    // Atualiza os dados originais
    const updatedOriginalResults = originalData.results.map((item) => {
      if (item.id === id) {
        const votou = item.votou;
        const votos = item.votos;

        return {
          ...item,
          votos: votou ? votos - 1 : votos + 1,
          votou: !votou,
        };
      }

      return item;
    });

    const newOriginalData = {
      ...originalData,
      results: updatedOriginalResults,
    };

    setOriginalData(newOriginalData);

    // Atualiza os dados filtrados
    const updatedFilteredResults = data.results.map((item) => {
      if (item.id === id) {
        const votou = item.votou;
        const votos = item.votos;

        return {
          ...item,
          votos: votou ? votos - 1 : votos + 1,
          votou: !votou,
        };
      }

      return item;
    });

    setData({ ...data, results: updatedFilteredResults });
  };

  const PostLike = async (id) => {
    try {
      handleLikeButton(id);

      await api.post(
        `/duvidas/${id}/votar/`,
        {},
        {
          headers: {
            Authorization: "Token " + (await GetLoginToken()),
          },
        }
      );
    } catch (error) {
      console.log(error.response);
    }
  };

  const DeleteLike = async (id) => {
    try {
      handleLikeButton(id);

      await api.delete(`/duvidas/${id}/votar/`, {
        headers: {
          Authorization: "Token " + (await GetLoginToken()),
        },
      });
    } catch (error) {
      console.log(error.response);
    }
  };

  // UseEffect separado para filtrar localmente por texto de pesquisa
  useEffect(() => {
    if (!originalData.results) return;

    if (filters.text.length === 0) {
      // Se não há texto de pesquisa, mostra todos os dados originais
      setData(originalData);
    } else {
      // Filtra localmente baseado no texto de pesquisa
      const filteredResults = originalData.results.filter(
        (post) =>
          post.titulo?.toLowerCase().includes(filters.text.toLowerCase()) ||
          post.descricao
            ?.toLowerCase()
            .includes(filters.text.toLowerCase()) ||
          post.autor?.perfil?.nome_exibicao
            ?.toLowerCase()
            .includes(filters.text.toLowerCase())
      );

      setData({
        ...originalData,
        results: filteredResults,
      });
    }
  }, [filters.text, originalData]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = (shouldRefresh = false) => {
    setIsRegisterModalOpen(false);

    if (shouldRefresh) {
      // Recarregar as dúvidas quando uma nova for criada
      setRefreshQuestions((prev) => prev + 1);
    }
  };

  const handleOpenAnswerModal = (question) => {
    setSelectedQuestion(question);
    setIsAnswerModalOpen(true);
  };

  const handleCloseAnswerModal = () => {
    setIsAnswerModalOpen(false);
    setSelectedQuestion(null);
  };

  // Função para alternar filtros
  const handleFilterChange = (filterType) => {
    setFilters((prev) => {
      // Primeiro, desativa todos os filtros
      const newFilters = {
        recent: false,
        responded: false,
        mostLiked: false,
        text: prev.text,
      };

      // Ativa apenas o filtro selecionado (ou desativa se já estiver ativo)
      if (!prev[filterType]) {
        newFilters[filterType] = true;
      }

      return newFilters;
    });
  };

  // Função para alterar texto de busca
  const handleSearchChange = (searchText) => {
    setFilters((prev) => ({
      ...prev,
      text: searchText,
    }));
  };

  // Função para lidar com o clique no menu de 3 pontos
  const handleMenuClick = (postId) => {
    console.log("Menu clicado para o post:", postId);
    // Aqui você pode implementar um menu dropdown ou modal
    // Por exemplo: abrir menu com opções: Editar, Deletar, Reportar, etc.
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <ForumHeader
          filters={filters}
          onFilterChange={handleFilterChange}
          searchValue={filters.text}
          onSearchChange={handleSearchChange}
        />{" "}

        <div className={styles.postsGrid}>
          {data.results && data.results.length > 0 ? (
            data.results.map((post, index) => (
              <Card
                key={post.id || index}
                author={
                  post.autor.perfil.nome_exibicao || "Autor Desconhecido"
                }
                title={post.titulo || "Sem título"}
                description={post.descricao || "Sem descrição"}
                date={formatDate(post.data)}
                comments={post.comentarios?.length || 0}
                likes={post.votos || 0}
                isResponded={post.respondida || false}
                avatar={post.avatar || perfil}
                onClick={() => handleOpenAnswerModal(post)}
                onLike={post.votou ? DeleteLike : PostLike}
                postId={post.id}
                isLiked={post.votou || false}
                onMenuClick={handleMenuClick}
              />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
                color: "#666",
                fontSize: "16px",
              }}
            >
              {loading
                ? "Carregando posts..."
                : "Nenhuma dúvida encontrada"}
            </div>
          )}
        </div>

        <FloatingButton onClick={handleOpenRegisterModal} />

        <RegisterDoubt
          isOpen={isRegisterModalOpen}
          onClose={handleCloseRegisterModal}
          title="CADASTRAR DÚVIDA"
        />

        <AnswerQuestions
          isOpen={isAnswerModalOpen}
          onClose={handleCloseAnswerModal}
          question={selectedQuestion}
        />
      </div>
    </div>
  );
}