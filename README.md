# Robótica — Sistema de Tutoriais de Montagem

Sistema de apresentação de slides de montagem para alunos e professores, organizado nos 3 cursos: **FirstBot**, **OneBot** e **TechBot**.

---

## 📽️ Modo Slide: Cada Passo em uma Imagem Separada

Ao clicar em qualquer robô do catálogo:
- Cada etapa da montagem é exibida como **um slide individual em tela cheia**, limpo, nítido e em alta resolução.
- **Estrutura dos Slides de cada Robô:**
  1. **Slide 1 — Visão Geral e Lista de Peças:** Exibe o robô montado e a tabela de peças necessárias.
  2. **Slides Intermediários — Passos 1 ao N:** Cada passo mecânico isolado em sua própria imagem grande.
  3. **Penúltimo Slide — Montagem Concluída (`OK`):** Foto/render do modelo totalmente construído.
  4. **Último Slide — Ligação Eletrônica:** Diagrama de conexão dos cabos, motores e sensores nas portas da placa controladora.
- **Navegação e Recursos:**
  - **Filtro de Aulas "MR":** botão direto na barra de ferramentas para filtrar instantaneamente as 188 aulas complementares do acervo My Robot (First, One e Tech).
  - **Zoom interativo na imagem:** botões `+` e `–`, atalhos de teclado (`+`, `-`, `0`), ou roda do mouse (scroll) e arrastar para explorar detalhes da montagem.
  - **Tema Claro e Escuro:** botão no cabeçalho com alternância e persistência automática.
  - Botões na tela (`← Anterior` e `Próximo →`).
  - Teclado: use as setas `←` e `→` ou a tecla **Espaço** para avançar os passos.
  - Barra de progresso linear no topo indicando a porcentagem de conclusão da montagem.
  - Régua inferior de miniaturas numeradas para saltar direto para qualquer etapa.
  - Botão de **Tela Cheia (F11)** para projetores e lousas digitais.

---

## 📚 Distribuição dos Cursos e Projetos

| Curso | Plataforma / Origem | Qtd. de Projetos | Total de Slides | Descrição |
| :--- | :--- | :---: | :---: | :--- |
| **FirstBot** | Padrão (28) + MR (51) | **79** | **1.942 slides** | Blocos modulares grandes de pinos, adaptadores, motores e sensores de toque. |
| **OneBot** | Padrão (32) + MR (50) | **82** | **2.348 slides** | Engrenagens coloridas, vigas, polias, bielas, eixos e sensores. |
| **TechBot** | Padrão (10) + MR (47) | **57** | **1.036 slides** | Perfis de alumínio/placas perfuradas pretas, parafusos, garras e componentes eletrônicos. |
| **SkillBot** | AI Module 1S-A & 1S-B | **48** | **485 slides** | Robótica inteligente e programação em blocos com motores de malha fechada. |
| **TOTAL** | — | **266** | **5.811 slides** | Acervo completo com filtro dedicado "MR" (148 aulas) |

---

## 🌐 Como Usar Sem Internet na Escola (Rede Local / Wi-Fi)

Para hospedar o site no seu computador e permitir que todos os alunos e outros computadores acessem mesmo **sem internet**:

1. Dê um duplo clique no arquivo **`INICIAR_SERVIDOR.bat`** (ou execute `py servidor_local.py`).
2. Uma janela preta abrirá mostrando o endereço de acesso, por exemplo:
   ```text
   http://10.101.198.24:8000
   ```
3. Nos computadores ou tablets dos alunos (conectados ao mesmo Wi-Fi da escola), basta abrir o navegador e digitar esse endereço.
4. Mantenha a janela aberta enquanto durar a aula!

---

## 🛠️ Remoção de Projetos Duplicados
- O **X-Soccer** do livro MRT3-1 Foundation (cuja digitalização era comprimida) foi substituído pela versão em alta definição vetorial do **MRT3-3 Intermediate** (**Robô de Futebol**), que traz o modelo completo com servomotor.
- O **Battle Robot** do MRT3-1 foi substituído pela versão completa e de alta resolução do **MRT3-3** (**Robô de Batalha com Toque**), com melhor resolução e inclusão do servomotor e sensor tátil.
