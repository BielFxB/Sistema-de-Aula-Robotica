# Bancada de Robótica — Sistema de Slides de Montagem Passo a Passo

Sistema interativo de apresentação de **slides de montagem passo a passo** para alunos e professores, organizado nos 3 cursos: **FirstBot**, **OneBot** e **TechBot**.

---

## 🚀 Como Abrir e Usar o Sistema

O sistema é **100% autônomo, offline e não necessita de internet ou instalação**:
1. Basta dar um duplo clique no arquivo [`index.html`](./index.html) para abrir diretamente no navegador padrão (Chrome, Edge, Firefox, etc.).
2. Ou, se preferir rodar via servidor local na rede da escola/sala de aula:
   ```bash
   py -m http.server 8080
   ```
   E acesse: `http://localhost:8080`

---

## 📽️ Modo Slide: Cada Passo em uma Imagem Separada

Ao clicar em **"Apresentar Slides"** em qualquer robô do catálogo:
- Cada etapa da montagem é exibida como **um slide individual em tela cheia**, limpo, nítido e em alta resolução.
- **Estrutura dos Slides de cada Robô:**
  1. **Slide 1 — Visão Geral e Lista de Peças:** Exibe o robô montado e a tabela de peças necessárias.
  2. **Slides Intermediários — Passos 1 ao N:** Cada passo mecânico isolado em sua própria imagem grande.
  3. **Penúltimo Slide — Montagem Concluída (`OK`):** Foto/render do modelo totalmente construído.
  4. **Último Slide — Ligação Eletrônica:** Diagrama de conexão dos cabos, motores e sensores nas portas da placa controladora.
- **Navegação Intuitiva:**
  - Botões grandes na tela (`← Anterior` e `Próximo →`)
  - Teclado: use as setas `←` e `→` ou a tecla **Espaço** para avançar os passos
  - Barra de progresso linear no topo indicando a porcentagem de conclusão da montagem
  - Régua inferior de miniaturas numeradas para saltar direto para qualquer etapa
  - Botão de **Tela Cheia (F11)** para projetores e lousas digitais
  - Aba para consultar o **PDF Completo** original ou baixar o arquivo formatado.

---

## 📚 Distribuição dos Cursos e Projetos

| Curso | Plataforma | Qtd. de Projetos | Total de Slides de Passo | Descrição |
| :--- | :--- | :---: | :---: | :--- |
| **FirstBot** | MRT1 Brain A + Logix5 | **28** | **906 slides** | Robótica introdutória com blocos modulares grandes de pinos e encaixe tátil, sensores de toque e motores DC. |
| **OneBot** | MRT3 (Foundation, Beginner, Intermediate) | **32** | **1.059 slides** | Robótica mecânica com engrenagens, polias, bielas, sensores infravermelhos (IR), toque, som, motores DC e servomotores. |
| **TechBot** | MRT-Duino (Arduino) | **10** | **178 slides** | Robótica avançada com estrutura de perfis de alumínio, parafusos/porcas, LEDs, sensor de luz CdS, buzzer, servomotor e potenciômetro. |
| **TOTAL** | — | **70** | **2.143 slides** | Acervo permanente completo |

---

## 🛠️ Remoção de Projetos Duplicados
- O **X-Soccer** do livro MRT3-1 Foundation (cuja digitalização era comprimida) foi substituído pela versão em alta definição vetorial do **MRT3-3 Intermediate** (**Robô de Futebol**), que traz o modelo completo com servomotor.
- O **Battle Robot** do MRT3-1 foi substituído pela versão completa e de alta resolução do **MRT3-3** (**Robô de Batalha com Toque**), com melhor resolução e inclusão do servomotor e sensor tátil.
