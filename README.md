# Cadastro de Obras em Andamento

Aplicativo mobile desenvolvido em **React Native** com **Expo** para registrar, monitorar e gerenciar obras em andamento, com funcionalidades de geolocalização, captura de fotos e gerenciamento de fiscalizações associadas.

---

## Funcionalidades

- **Cadastro de Obras** com informações detalhadas:
  - Nome da obra
  - Responsável
  - Data de início e previsão de término
  - Localização geográfica obtida via GPS
  - Foto da obra via câmera do dispositivo
  - Descrição opcional

- **Cadastro de Fiscalizações** vinculadas a obras existentes, contendo:
  - Data da fiscalização
  - Status da obra (Em dia, Atrasada, Parada)
  - Observações
  - Localização da fiscalização via GPS
  - Foto tirada no momento da fiscalização

- **Tela Home**: lista todas as obras cadastradas com informações resumidas

- **Detalhes da Obra**: exibe informações completas da obra e lista de fiscalizações associadas

- **Ações na tela de detalhes**:
  - Editar e excluir obras
  - Adicionar novas fiscalizações
  - Enviar relatório completo por email (com opção de digitar email)

---

## Tecnologias utilizadas

- React Native  
- Expo  
- React Navigation  
- Expo Location (para geolocalização)  
- Expo Camera (para fotos)  
- Expo Mail Composer (envio de emails)  
- Context API para gerenciamento global de estado  

---

## Como executar o projeto

### Pré-requisitos

- Node.js instalado  
- Expo CLI instalado globalmente:  
  ```bash
  npm install -g expo-cli
  
### Passos
  
- Clone o repositório:
  ```bash
  git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/CabralWalter/CadastroObras)

- Entre na pasta do projeto:
  ```bash
  cd seu-repositorio

- Instale as dependências:
  ```bash
  npm install
  
- Inicie o projeto:
  ```bash
  expo start
  
- Abra no seu dispositivo usando o app Expo Go ou emulador.
