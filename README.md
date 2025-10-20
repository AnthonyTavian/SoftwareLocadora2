# 🚗 LocadoraPro

Um sistema moderno de gerenciamento para locadoras de veículos, desenvolvido com Next.js e Electron.

## 🚀 Tecnologias

- [Next.js 14](https://nextjs.org/) - Framework React com SSR
- [Electron](https://www.electronjs.org/) - Framework para apps desktop
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática

## 📋 Requisitos

- [Node.js](https://nodejs.org/) (v18.0.0 ou superior)
- [pnpm](https://pnpm.io/) (v8.0.0 ou superior)

## 🛠️ Instalação

1. Clone o repositório
```bash
git clone https://github.com/AnthonyTavian/SoftwareLocadora2.git
cd SoftwareLocadora2
```

2. Instale as dependências
```bash
pnpm install
```

## 💻 Desenvolvimento

Inicie o ambiente de desenvolvimento:

```bash
# Apenas Next.js
pnpm dev

# Next.js + Electron
pnpm electron:dev
```

## 📦 Build

Gere uma versão de produção:

```bash
# Build completo (Next.js + Electron)
pnpm package

# Build separado
pnpm build:web      # Apenas Next.js
pnpm build:electron # Apenas Electron
```

## 🔍 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia Next.js em modo desenvolvimento |
| `pnpm electron:dev` | Inicia Electron + Next.js em desenvolvimento |
| `pnpm build:web` | Gera build de produção do Next.js |
| `pnpm build:electron` | Empacota o app com Electron Builder |
| `pnpm package` | Executa build completo (web + desktop) |

## 📱 Funcionalidades

- 📊 Dashboard com métricas principais
- 🚗 Gerenciamento de veículos
- 👥 Cadastro de clientes
- 📝 Controle de locações
- 🔧 Manutenção de veículos
- 📈 Relatórios gerenciais

## 🔒 Licença

Este software é proprietário e de uso exclusivo da empresa. Todos os direitos reservados.

## 👨‍💻 Autor

Desenvolvido por Anthony - [GitHub](https://github.com/AnthonyTavian)