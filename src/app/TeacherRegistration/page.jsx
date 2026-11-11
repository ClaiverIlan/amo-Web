import styles from "./page.module.css";

import Input from "@/components/input";

import VerticalLine from "@/components/verticalLine";

import About from "@/components/about";

import Title from "@/components/title";

import DefaultButton from "@/components/DefaultButton";

export default function TeacherRegistration() {
  return (
    <div className="container-border">
      <div className={styles.page}>
        <div className={styles.rightArea}>
          <About />
        </div>

        <VerticalLine />

        <div className={styles.leftArea}>
          <Title title="CADASTRE PROFESSOR" />

          <p
            style={{
              color: "white",
              textAlign: "justify",
              fontSize: "90%",
              marginTop: "70px",
            }}
          >
            Olá Docente, bem vindo(a) ao AMO! Para dar continuidade ao cadastro,
            envie um email para o endereço paeufcrussas@gmail.com com as
            seguintes informações:
          </p>

          <Input placeholder="NOME" />

          <Input placeholder="SIAPE" />

          <DefaultButton>
            Enviar email
          </DefaultButton>
        </div>
      </div>
    </div>
  );
}