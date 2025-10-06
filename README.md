# Demo Project - React + Node.js

Um projeto de demonstração com frontend React (TypeScript) e backend Node.js (Express + TypeScript) seguindo o padrão de rotas `/api/v1`.

## Estrutura do Projeto

```
demo-project/
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/    # Rotas da API (/api/v1/*)
│   │   └── server.ts  # Servidor principal
│   ├── database/      # Scripts SQL para Azure SQL Database
│   │   ├── 01_schema.sql
│   │   ├── 02_seed_users.sql
│   │   ├── 03_seed_projects.sql
│   │   └── 04_views_and_procedures.sql
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── services/  # Chamadas para API
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Backend - Node.js API

### Rotas Disponíveis

- `GET /` - Informações da API
- `GET /api/v1/health` - Health check
- `GET /api/v1/users` - Lista usuários
- `GET /api/v1/users/:id` - Busca usuário por ID
- `POST /api/v1/users` - Criar usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário

### Como executar o backend

```bash
cd backend
npm install
npm run dev    # Desenvolvimento
npm run build  # Build para produção
npm start      # Executar versão buildada
```

O backend roda na porta **3001**: http://localhost:3001

## Frontend - React

### Funcionalidades

- **Health Check**: Verifica status do backend
- **Users Management**: CRUD completo de usuários
- **Conexão API**: Usa axios com interceptors
- **TypeScript**: Tipagem completa

### Como executar o frontend

```bash
cd frontend
npm install
npm start      # Desenvolvimento
npm run build  # Build para produção
```

O frontend roda na porta **3000**: http://localhost:3000

## Configuração da Conexão

### Desenvolvimento
- Frontend: `REACT_APP_API_URL=http://localhost:3001/api/v1`
- Backend: porta 3001

### Produção (Azure)
- Frontend: `REACT_APP_API_URL=https://backend-pool.azurewebsites.net/api/v1`
- Backend: configurado automaticamente pelo workflow

## Database - Azure SQL

### Scripts SQL Incluídos

A pasta `backend/database/` contém scripts SQL que são executados automaticamente durante o deploy:

1. **01_schema.sql** - Estrutura do banco (tabelas users, projects, user_sessions)
2. **02_seed_users.sql** - 10 usuários de exemplo (3 admins, 7 users)
3. **03_seed_projects.sql** - 10 projetos de exemplo
4. **04_views_and_procedures.sql** - Views e stored procedures úteis

### Dados Incluídos

Após o deploy, o banco terá:
- ✅ Tabela de usuários com dados de exemplo
- ✅ Tabela de projetos vinculados aos usuários
- ✅ Índices para performance
- ✅ Views para consultas complexas
- ✅ Procedures para operações avançadas

## Deploy

Este projeto está configurado para deploy automático usando os workflows do GitHub Actions:

### Backend Stack: `node`
### Frontend Stack: `react`

Os workflows irão:
1. Fazer build do backend com TypeScript
2. Fazer build do frontend com as variáveis de ambiente corretas
3. **Criar Azure SQL Database automaticamente**
4. **Executar scripts SQL em ordem (01, 02, 03, 04...)**
5. Configurar a conexão entre frontend e backend automaticamente

## Testando Localmente

1. **Iniciar o backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Iniciar o frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Acessar:** http://localhost:3000

O frontend mostrará:
- ✅ Status do backend (se conectou)
- Lista de usuários com CRUD completo

## Variáveis de Ambiente

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api/v1
```

## Tecnologias Utilizadas

- **Backend**: Node.js, Express, TypeScript, CORS
- **Frontend**: React, TypeScript, Axios
- **Deploy**: GitHub Actions + Azure Web Apps