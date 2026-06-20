# MCP Console Refactored - Complete Setup Guide

A modern, modular React + TypeScript dashboard for AI tool management, prompt engineering, and integrations. This version includes a professional folder structure, strong TypeScript typing, and enhanced Customization Studio features.

## Quick Start

```bash
git clone https://github.com/oattia-ot/mcp-console-setup.git
cd mcp-console-setup
./setup.sh --start
```

## What Gets Deployed

The `setup.sh` script deploys a complete stack using Docker Compose:

### 1. MCP Console (`mcp-ui`) — Port 5173
- React 18 + TypeScript + Vite frontend
- Professional modular architecture (`src/components`, `src/pages`, `src/types`, `src/data`, `src/utils`)
- Features: Overview dashboard, User & Role management, Tools Library, Integrations, and **Customization Studio**
- Hot Module Replacement enabled inside Docker
- All dependencies installed during image build

### 2. Ollama (`ollama`) — Port 11434
- Local LLM inference server
- Automatically pulls `llama3.2` model during setup
- Model data persisted in Docker volume (`ollama_data`)
- The Customization Studio communicates with Ollama via `POST /api/generate`

### 3. Open WebUI (`open-webui`) — Port 8080
- Full-featured chat interface connected to the local Ollama instance
- Useful for independent model testing and conversations
- Data persisted in Docker volume (`open_webui_data`)

## Prerequisites

The setup script automatically verifies these requirements:

| Requirement       | Minimum     | Notes                                      |
|-------------------|-------------|--------------------------------------------|
| Docker            | Recent      | Docker daemon must be running              |
| Docker Compose    | v2          | Uses `docker compose` (not `docker-compose`) |
| Node.js           | v20+        | Only used for prerequisite verification    |
| npm               | Any         | Checked together with Node.js              |
| Git               | Any         | Required to clone the repository           |
| RAM               | 8 GB+       | Recommended for running Ollama models      |
| Disk Space        | 20 GB+      | LLM models can be several GB each          |

The script also checks that ports **5173**, **8080**, and **11434** are available.

## Available Commands

| Command                          | Description |
|----------------------------------|-----------|
| `./setup.sh`                     | Full setup: verify prerequisites, prepare project, build Docker images, start all services, and pull default model |
| `./setup.sh --start`             | Same as default + attempts to open browser at `http://localhost:5173` |
| `./setup.sh --verify-only`       | Only runs prerequisite checks and exits |
| `./setup.sh --stop`              | Stops all containers (`docker compose down`) |
| `./setup.sh --clean`             | Full destructive cleanup (containers + volumes + generated project folder) |
| `./setup.sh --logs [service]`    | Tails logs. Use without argument for all services, or specify `mcp-ui`, `ollama`, or `open-webui` |
| `./setup.sh --volumes`           | Interactive menu to manage Docker volumes |
| `./setup.sh --help`              | Shows usage information and service URLs |

## Service URLs After Setup

| Service          | URL                          |
|------------------|------------------------------|
| MCP Console      | http://localhost:5173        |
| Open WebUI       | http://localhost:8080        |
| Ollama API       | http://localhost:11434       |

## Working with Ollama Models

The default model `llama3.2` is pulled automatically.

To pull additional models:

```bash
docker compose exec ollama ollama pull mistral
docker compose exec ollama ollama pull qwen2.5
docker compose exec ollama ollama pull phi4
```

To list downloaded models:

```bash
docker compose exec ollama ollama list
```

## Updating the Application

When you modify source code in `src/`:

```bash
./setup.sh --clean
./setup.sh
```

Or rebuild without full cleanup:

```bash
docker compose up -d --build
```

## Troubleshooting

**Ollama is not responding**
```bash
curl http://localhost:11434/api/tags
./setup.sh --logs ollama
```

**MCP Console fails to load**
```bash
./setup.sh --logs mcp-ui
```

**Port conflict**
The script detects port conflicts and offers to kill the conflicting process.

**Start completely fresh**
```bash
./setup.sh --clean
./setup.sh
```

## Architecture Highlights

This refactored version includes:
- Strong TypeScript interfaces (`src/types/index.ts`)
- Centralized data (`src/data/constants.ts`)
- Reusable UI components (`src/components/common/`)
- Professional page separation (`src/pages/`)
- Tool context injection system in the Customization Studio
- Clean separation between data, utilities, and UI logic

---

*Last updated: June 2026*
```
