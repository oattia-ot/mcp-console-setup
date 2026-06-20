#!/bin/bash
set -euo pipefail

# ============================================================
#              MCP CONSOLE REFACTORED - FULL STACK
#                    Professional Setup Script v2.8
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_VERSION="2.8"
PROJECT_DIR="mcp-console"

# --------------------------- FUNCTIONS ----------------------

print_header() {
    echo -e "${CYAN}${BOLD}"
    echo "╔═════════════════════════════════════════════════════════════════╗"
    echo "║           MCP Console + Ollama + Open WebUI  v${SCRIPT_VERSION}               ║"
    echo "╚═════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_help() {
    echo -e "${CYAN}${BOLD}MCP Console Full Stack Setup v${SCRIPT_VERSION}${NC}"
    echo ""
    echo -e "${BOLD}Usage:${NC}"
    echo -e "  ${GREEN}./setup.sh${NC}                    Full setup (default)"
    echo -e "  ${GREEN}./setup.sh --start${NC}            Same as above (starts the stack)"
    echo -e "  ${GREEN}./setup.sh --verify-only${NC}"
    echo -e "  ${GREEN}./setup.sh --stop${NC}"
    echo -e "  ${GREEN}./setup.sh --clean${NC}"
    echo -e "  ${GREEN}./setup.sh --logs [service]${NC}"
    echo ""
    exit 0
}

verify_prerequisites() {
    echo -e "${CYAN}${BOLD}🔍 Checking prerequisites...${NC}"
    local ERRORS=0
    for cmd in docker node npm git; do
        command -v "$cmd" &>/dev/null && echo -e "${GREEN}✅ $cmd${NC}" || { echo -e "${RED}❌ $cmd missing${NC}"; ERRORS=$((ERRORS+1)); }
    done
    docker info &>/dev/null || { echo -e "${RED}❌ Docker daemon not running${NC}"; ERRORS=$((ERRORS+1)); }
    [ $ERRORS -eq 0 ] && echo -e "${GREEN}✅ All checks passed.${NC}" || exit 1
}

handle_container_conflict() {
    local existing_containers=()
    for name in mcp-ui ollama open-webui; do
        if docker ps -a --format '{{.Names}}' | grep -q "^$name$"; then
            existing_containers+=("$name")
        fi
    done

    if [ ${#existing_containers[@]} -eq 0 ]; then
        return 0
    fi

    echo -e "${YELLOW}⚠️  The following containers already exist:"
    for name in "${existing_containers[@]}"; do
        echo -e "   - $name"
    done

    echo ""
    read -rp "Do you want to remove all of them? [y/N]: " confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        for name in "${existing_containers[@]}"; do
            echo -e "${BLUE}🗑 Removing container: $name...${NC}"
            docker rm -f "$name" 2>/dev/null || true
        done
        echo -e "${GREEN}✅ All conflicting containers have been removed.${NC}"
    else
        echo -e "${RED}❌ Cannot continue while conflicting containers exist. Exiting.${NC}"
        exit 1
    fi
}

handle_error() {
    echo -e "\n${RED}❌ Error on line $LINENO${NC}"
    exit 1
}
trap handle_error ERR

# --------------------------- ARGUMENT PARSING ----------------------
DO_STOP=false
DO_CLEAN=false
DO_LOGS=false
VERIFY_ONLY=false
LOGS_SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help) show_help ;;
        --start) shift ;;                    # <-- Added for compatibility (does nothing, starts by default)
        --stop) DO_STOP=true; shift ;;
        --clean) DO_CLEAN=true; shift ;;
        --verify-only) VERIFY_ONLY=true; shift ;;
        --logs)
            DO_LOGS=true
            [[ -n "${2:-}" ]] && { LOGS_SERVICE="$2"; shift 2; } || shift
            ;;
        *) echo -e "${RED}Unknown option: $1${NC}"; show_help ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJ="${SCRIPT_DIR}/${PROJECT_DIR}"

# --------------------------- HOUSEKEEPING ----------------------
if [ "$DO_STOP" = true ]; then
    echo -e "${YELLOW}⏹ Stopping all services...${NC}"
    [ -d "$PROJ" ] && cd "$PROJ" && docker compose down
    echo -e "${GREEN}✅ All services stopped.${NC}"
    exit 0
fi

if [ "$DO_CLEAN" = true ]; then
    echo -e "${RED}${BOLD}This will remove containers, volumes and project folder."
    read -rp "Continue? [y/N]: " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
    echo -e "${YELLOW}🧹 Performing full cleanup...${NC}"

    if [ -d "$PROJ" ]; then
        cd "$PROJ" && docker compose down -v --remove-orphans 2>/dev/null || true
        cd "$SCRIPT_DIR"
        rm -rf "$PROJ"
    fi
    docker rm -f mcp-ui ollama open-webui 2>/dev/null || true
    docker volume rm ollama_data open_webui_data 2>/dev/null || true
    echo -e "${GREEN}✅ Full cleanup done.${NC}"
    exit 0
fi

if [ "$DO_LOGS" = true ]; then
    [ -d "$PROJ" ] && cd "$PROJ" && docker compose logs -f ${LOGS_SERVICE:-}
    exit 0
fi

# --------------------------- MAIN ----------------------
print_header
verify_prerequisites
[ "$VERIFY_ONLY" = true ] && exit 0

echo -e "${BLUE}📦 Preparing mcp-console full stack...${NC}"

# Extract project
TARBALL="${SCRIPT_DIR}/mcp-console.tar.gz"
if [ -f "$TARBALL" ]; then
    rm -rf "$PROJ"
    tar -xzf "$TARBALL" -C "$SCRIPT_DIR"
elif [ -d "${SCRIPT_DIR}/mcp-console" ]; then
    rm -rf "$PROJ"
    cp -r "${SCRIPT_DIR}/mcp-console" "$PROJ"
else
    echo -e "${RED}❌ mcp-console.tar.gz not found.${NC}"
    exit 1
fi

cd "$PROJ"
handle_container_conflict

# .env handling
ENV_FILE="${SCRIPT_DIR}/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Creating default .env file...${NC}"
    cat > "$ENV_FILE" << 'EOT'
VITE_OLLAMA_URL=http://ollama:11434
DEFAULT_MODEL=gemma3:12b
EOT
fi

set -a
source "$ENV_FILE"
set +a

VITE_OLLAMA_URL="${VITE_OLLAMA_URL:-http://ollama:11434}"
DEFAULT_MODEL="${DEFAULT_MODEL:-gemma3:12b}"

echo -e "${BLUE}Using model from .env: ${BOLD}${DEFAULT_MODEL}${NC}"

# Create Dockerfile
cat > Dockerfile << 'EOF'
# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

ARG VITE_OLLAMA_URL=http://localhost:11434
ENV VITE_OLLAMA_URL=$VITE_OLLAMA_URL

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << EOF
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "8080:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY=change-this-secret
    depends_on:
      - ollama
    volumes:
      - open_webui_data:/app/backend/data
    restart: unless-stopped

  mcp-ui:
    build:
      context: .
      args:
        - VITE_OLLAMA_URL=${VITE_OLLAMA_URL}
    container_name: mcp-ui
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_OLLAMA_URL=${VITE_OLLAMA_URL}
      - VITE_DEFAULT_MODEL=${DEFAULT_MODEL}
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
  open_webui_data:
EOF

echo -e "${BLUE}🐳 Starting full stack...${NC}"
docker compose down 2>/dev/null || true
docker compose up -d --build

echo -e "${GREEN}✅ Pulling model: ${DEFAULT_MODEL}...${NC}"
docker compose exec -T ollama ollama pull "${DEFAULT_MODEL}" || true

echo ""
echo -e "${GREEN}${BOLD}✅ Full Stack is Ready!${NC}"
echo ""
echo -e "  ${CYAN}MCP Console${NC}   →  ${BOLD}http://localhost:5173${NC}"
echo -e "  ${CYAN}Open WebUI${NC}    →  ${BOLD}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}Model in use:${NC} ${BOLD}${DEFAULT_MODEL}${NC}"
echo -e "${YELLOW}Edit ${BOLD}${ENV_FILE}${NC} to change the model.${NC}"
echo ""