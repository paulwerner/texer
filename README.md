# TeXer - Convenient LaTeX Editor

A web-based editor for creating, rendering, and exporting algorithm exercise PDFs with LaTeX. Features live preview, auto-compilation, built-in LaTeX command shortcuts, and Docker containerization.

## Features

- 🎨 **Live Preview** - Real-time PDF rendering as you type
- ⚡ **Smart Compilation** - Auto-compile mode (2s after typing) or manual compile mode with hover-to-switch dropdown
- 🔧 **Built-in Commands** - Slash command autocomplete with 40+ commonly used LaTeX commands
- 📝 **Split View** - Side-by-side editor and PDF preview, or editor-only mode
- 📄 **Exercise Management** - Each exercise starts on page 1 with independent numbering
- 💾 **Export** - Download complete sheet or split exercises as separate PDFs
- 🐳 **Docker Support** - Fully containerized with pre-installed LaTeX
- 🚀 **Production Ready** - Deploy to Google Cloud Run, AWS, and more

## Tech Stack

**Frontend:** React 19, TailwindCSS, shadcn/ui, Axios, Lucide Icons

**Backend:** Node.js + Express, pdflatex (TeXLive), File system management

**Infrastructure:** Docker (node:22-slim + TeXLive)

---

## Quick Start

### Using Docker (Recommended)

1. **Setup and Start**
   ```bash
   ./setup.sh # may take a few minutes on the first run
   docker compose up
   ```

2. **Access the Application**
   - Open http://localhost:3000
   - Backend API: http://localhost:5000

3. **Stop the Application**
   ```bash
   # Press Ctrl+C, or run:
   docker compose down
   ```

### Local Development (Without Docker)

**Prerequisites:**
- Node.js 22+
- TeXLive or MiKTeX (full installation)
- pdflatex in PATH

**Setup:**

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. **Start Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start  # Runs on http://localhost:5000

   # Terminal 2: Frontend
   cd frontend
   npm start  # Opens http://localhost:3000
   ```

---

## Usage

### Creating an Exercise

1. Set exercise number in the header input field
2. Type `/` in the editor to open the command autocomplete menu
3. Search and select commands (e.g., `/exercise` → `\exercisetitle{}`)
4. Write your problem and solution using LaTeX
5. **Compilation Modes:**
   - **Auto-Compile** (default): PDF updates automatically 2 seconds after you stop typing
   - **Manual Compile**: Click "Compile" button to render PDF on demand
   - **Switch modes**: Hover over compile button to show mode dropdown
   - Editor-only mode automatically switches to manual compile
6. Review PDF in the right panel (or hide it with "Editor Only" button)
7. Click "Download" dropdown to save complete sheet or split exercises

### LaTeX Command Reference

The editor provides slash command autocomplete with 40+ commands. Type `/` in the editor and search by name or keyword.

**Complexity & Algorithm Commands:**
| Command | Output | Description |
|---------|--------|-------------|
| `\BigO{}` | O(n) | Big O notation |
| `\BigOmega{}` | Ω(n) | Big Omega lower bound |
| `\BigTheta{}` | Θ(n) | Big Theta tight bound |

**Math Functions:**
| Command | Output | Description |
|---------|--------|-------------|
| `\floor{}` | ⌊x⌋ | Floor function |
| `\ceil{}` | ⌈x⌉ | Ceiling function |
| `\abs{}` | \|x\| | Absolute value |
| `\sqrt{}` | √x | Square root |
| `\frac{}{}` | a/b | Fraction |
| `\log_{}` | log | Logarithm with base |
| `\ln` | ln | Natural logarithm |

**Set Theory:**
| Command | Output | Description |
|---------|--------|-------------|
| `\set{}` | {1,2,3} | Set notation |
| `\card{}` | \|A\| | Set cardinality |
| `\in` | ∈ | Element of set |
| `\notin` | ∉ | Not element of set |
| `\subset` | ⊂ | Proper subset |
| `\subseteq` | ⊆ | Subset or equal |
| `\cup` | ∪ | Set union |
| `\cap` | ∩ | Set intersection |
| `\emptyset` | ∅ | Empty set |

**Comparison Operators:**
| Command | Output | Description |
|---------|--------|-------------|
| `\leq` | ≤ | Less than or equal |
| `\geq` | ≥ | Greater than or equal |
| `\neq` | ≠ | Not equal |
| `\approx` | ≈ | Approximately equal |
| `\equiv` | ≡ | Equivalent to |

**Logic & Quantifiers:**
| Command | Output | Description |
|---------|--------|-------------|
| `$x \gets y$` | x ← y | Assignment operator |
| `\AND` | ∧ | Logical AND |
| `\OR` | ∨ | Logical OR |
| `\NOT` | ¬ | Logical NOT |
| `\TRUE` | TRUE | Boolean true |
| `\FALSE` | FALSE | Boolean false |
| `\forall` | ∀ | For all (universal) |
| `\exists` | ∃ | There exists |

**Number Sets:**
| Command | Output | Description |
|---------|--------|-------------|
| `\N` | ℕ | Natural numbers |
| `\Z` | ℤ | Integers |
| `\R` | ℝ | Real numbers |

**Arrows & Implications:**
| Command | Output | Description |
|---------|--------|-------------|
| `\rightarrow` | → | Right arrow |
| `\leftarrow` | ← | Left arrow |
| `\Rightarrow` | ⇒ | Implies |
| `\Leftrightarrow` | ⇔ | If and only if (iff) |

**Summation & Limits:**
| Command | Output | Description |
|---------|--------|-------------|
| `\sum_{i=0}^{n}` | Σ | Summation with limits |
| `\prod_{i=0}^{n}` | Π | Product with limits |
| `\lim_{n \to \infty}` | lim | Limit as n approaches |
| `\infty` | ∞ | Infinity symbol |

**Text Formatting:**
| Command | Output | Description |
|---------|--------|-------------|
| `\textbf{}` | **bold** | Bold text |
| `\textit{}` | *italic* | Italic text |
| `\emph{}` | *emphasized* | Emphasized text |
| `\underline{}` | underline | Underlined text |
| `\texttt{}` | `monospace` | Monospace/code text |

**Document Structure:**
| Command | Output | Description |
|---------|--------|-------------|
| `\section{}` | Section | Section heading |
| `\subsection{}` | Subsection | Subsection heading |
| `\exercisetitle{}` | - | Start new exercise |
| `\exercisepart{}` | - | Add exercise subsection |

**Templates:**
- **Algorithm Block**: Complete algorithm environment with numbered lines

### Slash Command Autocomplete

The editor features an intelligent command autocomplete system:

1. **Trigger**: Type `/` anywhere in the editor
2. **Search**: Type to search commands by name or keywords (e.g., `/sum` finds summation, `/big` finds BigO/BigOmega/BigTheta)
3. **Navigate**: Use ↑/↓ arrow keys or mouse to select
4. **Insert**: Press Enter, Tab, or click to insert
5. **Smart Wrapping**: Math commands automatically wrap in `$...$` or `\[...\]` depending on context
6. **Cursor Positioning**: Cursor automatically placed inside `{}` or at optimal edit position

**Example Searches:**
- `/floor` → `\floor{}`
- `/sum` → `\sum_{i=0}^{n}`
- `/big` → Shows BigO, BigOmega, BigTheta
- `/set` → Shows set operations (set, subset, emptyset, etc.)
- `/arrow` → Shows all arrow commands

### Exercise Structure Example

```latex
\exercisetitle{Exercise 1: Algorithm Analysis}

\exercisepart{Part (a)}

\textbf{Problem:} Analyze the time complexity of binary search.

\textbf{Solution:} The time complexity is $\BigO{\log n}$ because...

\[
    T(n) = T\left(\frac{n}{2}\right) + \BigO{1}
\]
```

### Algorithm Blocks

Type `/algorithm` or `/alg` to insert a complete algorithm template:

```latex
\begin{algorithm}
\caption{Binary Search}\label{alg:binsearch}
\begin{algorithmic}[1]
\Require Sorted array $A[1..n]$, target value $x$
\Ensure Index of $x$ or $-1$ if not found
\State $low \gets 1$
\State $high \gets n$
\While{$low \leq high$}
    \State $mid \gets \floor{(low + high)/2}$
    \If{$A[mid] = x$}
        \State \Return $mid$
    \ElsIf{$A[mid] < x$}
        \State $low \gets mid + 1$
    \Else
        \State $high \gets mid - 1$
    \EndIf
\EndWhile
\State \Return $-1$
\end{algorithmic}
\end{algorithm}
```

### Exporting PDFs

1. Click "Download" button dropdown
2. Choose export option:
   - **Complete Sheet**: Single PDF with all exercises (`sheet_N.pdf`)
   - **Split Exercises**: ZIP file with individual PDFs per exercise (`sheet_N_exercises.zip`)
3. PDFs include line numbers, page numbers, and algorithm numbering
4. Each split exercise starts on page 1 with independent numbering

---

## Project Structure

```
texer/
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LatexEditor.jsx    # Main editor component
│   │   │   ├── CommandAutocomplete.jsx  # Slash command dropdown
│   │   │   ├── Button.jsx         # shadcn Button component
│   │   │   └── Card.jsx           # shadcn Card component
│   │   ├── lib/
│   │   │   └── utils.js           # Utility functions
│   │   ├── App.js                 # Root component
│   │   ├── index.js               # Entry point
│   │   ├── index.css              # Tailwind + theme variables
│   │   └── App.css                # App-specific styles
│   ├── public/
│   │   └── index.html
│   ├── package.json               # Frontend dependencies
│   ├── tailwind.config.js         # Tailwind configuration
│   └── postcss.config.js          # PostCSS configuration
│
├── backend/                        # Express server
│   ├── server.js                  # Main server (API routes)
│   ├── template.tex               # LaTeX template
│   └── package.json               # Backend dependencies
│
├── docs/
│   ├── ARCHITECTURE.md            # System design (optional reading)
│   └── EXAMPLES.tex               # Example exercises
│
├── Dockerfile                      # Docker image definition
├── docker-compose.yml              # Docker Compose configuration
├── setup.sh                        # Setup script
└── README.md                       # This file
```

### Key Components

**LatexEditor.jsx** (Frontend)
- Slash command autocomplete with 40+ pre-configured LaTeX commands
- Smart compilation modes: auto-compile (2s debounce) or manual compile
- Professional hover dropdown for mode switching (Stripe/Vercel pattern)
- Split view: side-by-side editor and PDF preview, or editor-only mode
- Automatic mode switching: editor-only forces manual compile
- Dynamic exercise numbering
- PDF download: complete sheet or split exercises
- Error handling and display
- Smart math mode wrapping for commands

**server.js** (Backend)
- `/api/health` - Health check endpoint
- `/api/template` - Serve LaTeX template
- `/api/compile` - Compile full LaTeX document to PDF
- `/api/compile-split` - Compile individual exercises separately and return as ZIP
- Temporary directory management and cleanup
- Detailed error logging

**template.tex** (LaTeX Template)
- Custom commands (BigO, BigTheta, floor, ceil, etc.)
- Exercise structure commands
- Line and page numbering
- Professional formatting
- Algorithm environments with algorithmic package

---

## API Reference

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/template`
Returns the LaTeX template content.

**Response:** LaTeX template as text/plain

### POST `/api/compile`
Compiles LaTeX content to PDF.

**Request Body:**
```json
{
  "content": "Full LaTeX document content"
}
```

**Response:**
- Success: PDF file (application/pdf)
- Error: 
  ```json
  {
    "error": "Compilation failed",
    "details": "Error message from pdflatex",
    "log": "Full compilation log"
  }
  ```

### POST `/api/compile-split`
Compiles individual exercises separately and returns a ZIP file.

**Request Body:**
```json
{
  "content": "Full LaTeX document content",
  "sheetNumber": 1
}
```

**Response:**
- Success: ZIP file (application/zip) containing separate PDFs for each exercise
- Error: 
  ```json
  {
    "error": "Split compilation failed",
    "details": "Error message from pdflatex"
  }
  ```

---

## Production Deployment

### Docker Production Build

1. **Create Production Dockerfile** (`Dockerfile.prod`)
   ```dockerfile
   FROM node:22-slim
   
   ENV DEBIAN_FRONTEND=noninteractive
   
   # Install minimal TeXLive and nginx
   RUN apt-get update && apt-get install -y --no-install-recommends \
       nginx \
       curl \
       texlive-latex-base \
       texlive-latex-recommended \
       texlive-science \
       texlive-pictures \
       texlive-fonts-recommended \
     && rm -rf /var/lib/apt/lists/* \
     && rm -rf /usr/share/doc/* /usr/share/man/* /usr/share/info/*
   
   WORKDIR /app
   
   # Backend
   COPY backend/package*.json ./backend/
   RUN cd backend && npm install --omit=dev
   COPY backend ./backend
   
   # Frontend
   COPY frontend/package*.json ./frontend/
   RUN cd frontend && npm install
   COPY frontend ./frontend
   RUN cd frontend && npm run build
   
   # Setup nginx
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   
   COPY start.sh /start.sh
   RUN chmod +x /start.sh
   CMD ["/start.sh"]
   ```

2. **Create nginx.conf**
   ```nginx
   events {
       worker_connections 1024;
   }
   
   http {
       include /etc/nginx/mime.types;
       
       server {
           listen 80;
           server_name _;
           
           # Frontend
           location / {
               root /app/frontend/build;
               try_files $uri $uri/ /index.html;
           }
           
           # Backend API
           location /api {
               proxy_pass http://localhost:5000;
               proxy_http_version 1.1;
               proxy_set_header Upgrade $http_upgrade;
               proxy_set_header Connection 'upgrade';
               proxy_set_header Host $host;
               proxy_cache_bypass $http_upgrade;
           }
       }
   }
   ```

3. **Create start.sh**
   ```bash
   #!/bin/bash
   cd /app/backend
   node server.js &
   nginx -g 'daemon off;'
   ```

4. **Build and Run**
   ```bash
   docker build -f Dockerfile.prod -t texer:prod .
   docker run -p 80:80 texer:prod
   ```

### Cloud Deployment Options

#### Google Cloud Run

```bash
# Set project
gcloud config set project <your-project-id>

# Build and deploy
gcloud builds submit --tag gcr.io/<your-project-id>/texer
gcloud run deploy texer \
  --image gcr.io/<your-project-id>/texer \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

#### AWS EC2

```bash
# SSH into instance
ssh ubuntu@<your-ec2-ip>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and run
git clone https://github.com/paulwerner/texer.git
cd texer
docker build -f Dockerfile.prod -t texer:prod .
docker run -d -p 80:80 --restart unless-stopped texer:prod
```

### Environment Variables

Create `.env.production`:

```env
# Backend
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=50mb
COMPILE_TIMEOUT=30000

# Frontend (build time)
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENV=production
```

### Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set strong CORS policies
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Implement authentication (if needed)
- [ ] Configure firewall rules
- [ ] Regular backups

---

## Development

### Adding New LaTeX Commands

1. **Update Frontend**
   
   Edit `frontend/src/components/LatexEditor.jsx`, add to `LATEX_COMMANDS` object:
   ```javascript
   const LATEX_COMMANDS = {
     // ... existing commands
     '\\newcmd{}': { 
       label: 'New Command',
       description: 'Description shown in autocomplete',
       keywords: ['new', 'command', 'searchable', 'keywords'],
       symbol: '⚡', // Icon shown in dropdown
       requiresMathMode: false, // true if command needs $ $ or \[ \]
       isTemplate: false // true for multi-line templates
     },
   };
   ```

2. **Update Backend Template** (if needed)
   
   Edit `backend/template.tex`, add command definition:
   ```latex
   \newcommand{\newcmd}[1]{...}
   ```

3. **Command Features**
   - Fuzzy search by label or keywords
   - Automatic math mode wrapping (`requiresMathMode: true`)
   - Smart cursor positioning (inside `{}` or at specific positions)
   - Multi-line template support

### Modifying the Template

Edit `backend/template.tex` to customize:
- Page layout and margins
- Custom command definitions
- Header/footer format
- Package imports
- Line numbering behavior

Changes take effect immediately (hot reload in Docker dev mode).

### Development Workflow

1. Make changes to source files
2. Changes auto-reload (Docker volume mounts)
3. Test in browser at http://localhost:3000
4. Check backend logs: `docker compose logs backend`
5. Check frontend logs in browser console

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## Troubleshooting

### Compilation Errors

**Issue:** "Compilation failed" error in preview

**Solutions:**
- Check LaTeX syntax (balanced braces, correct math mode)
- Ensure all `\begin{}` have matching `\end{}`
- Verify math mode delimiters: `$...$` for inline, `\[...\]` for display
- Check backend logs: `docker compose logs backend`

**Common LaTeX errors:**
- Missing `$` inserted - Forgot to wrap math in `$...$`
- Undefined control sequence - Typo in command name
- Missing \begin{document} - Template issue (shouldn't happen)

### PDF Not Showing

**Issue:** PDF preview is blank or not updating

**Solutions:**
- Check compilation mode: hover over compile button to see if in auto or manual mode
- **Auto mode**: Wait 2-3 seconds after stopping typing
- **Manual mode**: Click "Compile" button to trigger compilation
- Switch to auto mode if you want automatic updates
- Check browser console for errors (F12)
- Verify backend is running: `curl http://localhost:5000/api/health`
- Hard refresh browser (Ctrl+Shift+R)

### Docker Issues

**Issue:** Container fails to start

**Solutions:**
```bash
# Rebuild containers
docker compose down
docker compose up --build

# Check logs
docker compose logs

# Verify Docker is running
docker ps
```

**Issue:** "Port already in use" error

**Solutions:**
```bash
# Option 1: Kill process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Option 2: Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "5001:5000"  # Backend
```

### Permission Issues

**Issue:** Permission denied errors with Docker

**Solutions:**
```bash
# Set proper UID/GID
export UID=$(id -u)
export GID=$(id -g)
docker compose up

# Or add to docker-compose.yml
user: "${UID}:${GID}"
```

### TeXLive Issues

**Issue:** Missing LaTeX packages

**Solutions:**
- The Docker image includes minimal TeXLive with required packages
- If using local setup, install required packages:
  ```bash
  # Ubuntu/Debian (minimal, ~500MB)
  sudo apt-get install texlive-latex-base texlive-latex-recommended \
    texlive-science texlive-pictures texlive-fonts-recommended
  
  # Or full TeXLive (warning: ~5GB disk space)
  sudo apt-get install texlive-full
  
  # macOS
  brew install --cask basictex  # Minimal (~100MB)
  # Or: brew install --cask mactex  # Full (~4GB)
  ```

### Performance Issues

**Issue:** Slow compilation or high memory usage

**Solutions:**
- Limit concurrent compilations
- Increase Docker memory: Docker Desktop → Settings → Resources
- Clean up temp files: `docker compose exec backend rm -rf /tmp/latex/*`
- Reduce image size by removing unused TeXLive packages

---

## License

CC0 1.0 Universal (Public Domain) - Free to use, modify, and distribute without any restrictions. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built for algorithm course exercises
- Uses TeXLive for LaTeX compilation
- UI components from shadcn/ui
- Icons from Lucide

---

**Ready to use?** Just run `./setup.sh && docker compose up` and open http://localhost:3000

For more technical details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)  
For example exercises, see [docs/EXAMPLES.tex](docs/EXAMPLES.tex)
