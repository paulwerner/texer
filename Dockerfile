FROM node:22-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install minimal TeXLive and only required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Minimal LaTeX base (article class, basic LaTeX)
    texlive-latex-base \
    # Essential packages (geometry, fancyhdr, hyperref, booktabs, etc.)
    texlive-latex-recommended \
    # Math & Algorithm packages (amsmath, algorithm, algpseudocode)
    texlive-science \
    # Graphics packages (graphicx, xcolor, tikz if needed)
    texlive-pictures \
    # Fonts (only recommended, not extra)
    texlive-fonts-recommended \
    # Utilities
    curl \
  && rm -rf /var/lib/apt/lists/* \
  # Clean up unnecessary documentation and man pages
  && rm -rf /usr/share/doc/* \
  && rm -rf /usr/share/man/* \
  && rm -rf /usr/share/info/*

WORKDIR /app

# --- backend deps ---
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --omit=dev

# --- frontend deps ---
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install

# --- app source ---
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

RUN mkdir -p /tmp/latex && chown -R node:node /tmp/latex /app

# Run as non-root user for security
USER node

EXPOSE 3000 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["sh", "-c", "cd /app/backend && npm start & cd /app/frontend && npm start"]
