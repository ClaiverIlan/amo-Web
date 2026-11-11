"use client";

import styles from "./page.module.css";

import Image from "next/image";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import Input from "@/components/input";

import VerticalLine from "@/components/verticalLine";

import Title from "@/components/title";

import SubLink from "@/components/subLink";

import DefaultButton from "@/components/DefaultButton";

import Foto from "../../../assets/perfil.png";

import { useAuth } from "@/context/auth";

import api from "@/service/api";

import { API_ENDPOINTS } from "@/constants/endpoints";

import { GetLoginToken } from "@/util/StorageLogin";

export default function ProfilePicture() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

  const [courses, setCourses] = useState([]);

  const [years, setYears] = useState([]);

  const [personalData, setPersonalData] = useState({
    name: "",
    nickName: "",
    registration: "",
    entryYear: "",
    course: {
      id: null,
      nome: "",
    },
  });

  const [inputErros, setInputErros] = useState({
    errosNickName: null,
    errosName: null,
    errosRegistration: null,
    errosEntryear: null,
    errosCourse: null,
    responseErros: null,
  });

  const { CompleteRegister } = useAuth();

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    let tempYears = [];

    for (let i = 2015; i <= currentYear; i++) {
      tempYears.push(i);
    }

    setYears(tempYears);

    async function GetCourses() {
      try {
        const response = await api.get("/cursos/", {
          headers: {
            Authorization: "Token " + (await GetLoginToken()),
          },
        });

        const listCourses = response.data.results;

        setCourses(listCourses);
      } catch (error) {
        console.log(error.response.data);
      }
    }

    GetCourses();
  }, []);

  const InputValidation = async () => {
    setLoading(true);

    let erros = {
      errosName: null,
      errosNickName: null,
      errosEntryear: null,
      errosCourse: null,
      responseErros: null,
      errosRegistration: null,
    };

    if (personalData.name.trim().length < 3) {
      erros.errosName = "Nome inválido!";
    }

    if (
      !/^[0-9]+$/.test(personalData.registration.trim()) ||
      personalData.registration.length < 6 ||
      personalData.registration.length > 7
    ) {
      erros.errosRegistration = "Matrícula inválida!";
    }

    if (!personalData.nickName.trim()) {
      erros.errosNickName = "Nome de exibição inválido!";
    }

    if (!personalData.entryYear.trim()) {
      erros.errosEntryear = "Ano de entrada não pode está vazio!";
    }

    if (!personalData.course.id) {
      erros.errosCourse = "Curso não pode está vazio!";
    }

    setInputErros(erros);

    if (
      !erros.errosUser &&
      !erros.errosName &&
      !erros.errosNickName &&
      !erros.errosEntryear &&
      !erros.errosCourse &&
      !erros.errosRegistration
    ) {
      const response = await CompleteRegister(personalData);

      console.log("Cadastro completo com sucesso!", response);

      if (response === personalData.nickName) {
        router.push("/RegistrationCompleted");

        console.log("Cadastro completo com sucesso!");
      } else {
        setInputErros({ ...erros, responseErros: response });
      }
    }

    setLoading(false);

    return null;
  };

  const handleInputChange = (field, value) => {
    setPersonalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container-border">
      <div className={styles.page}>
        <div className={styles.rightArea}>
          <Title title="ESTAMOS QUASE LA" />

          <Input
            placeholder="NOME DE USUARIO"
            value={personalData.nickName}
            onChange={(value) => handleInputChange("nickName", value)}
            error={inputErros.errosNickName}
          />

          <Input
            placeholder="NOME COMPLETO"
            value={personalData.name}
            onChange={(value) => handleInputChange("name", value)}
            error={inputErros.errosName}
          />

          <Input
            placeholder="MATRICULA"
            value={personalData.registration}
            onChange={(value) =>
              handleInputChange("registration", value)
            }
            error={inputErros.errosRegistration}
          />

          <Input
            placeholder="ANO DE ENTRADA"
            value={personalData.entryYear}
            onChange={(value) =>
              handleInputChange("entryYear", value)
            }
            error={inputErros.errosEntryear}
          />

          <Input
            placeholder="SELECIONAR O CURSO"
            items={courses}
            value={personalData.course.nome}
            onChange={(value) => {
              console.log("Curso selecionado:", value);
              console.log("Lista de cursos disponíveis:", courses);

              const selectedCourse = courses.find(
                (course) => course.nome === value
              );

              console.log("Curso encontrado:", selectedCourse);

              if (selectedCourse) {
                handleInputChange("course", selectedCourse);
              }
            }}
            error={inputErros.errosCourse}
          />
        </div>

        <VerticalLine />

        <div className={styles.leftArea}>
          <Title title="SELECIONE SUA FOTO DE PERFIL" />

          <Image
            className={styles.profileImage}
            src={Foto}
            alt="Logo"
            crossOrigin="anonymous"
          />

          <SubLink subtitle="PULAR ETAPA" />

          <DefaultButton onClick={InputValidation}>
            Prosseguir
          </DefaultButton>
        </div>
      </div>
    </div>
  );
}