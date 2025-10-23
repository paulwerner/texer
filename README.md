# TeXer - Convenient LaTeX Editor

A web-based editor for creating, rendering, and exporting algorithm exercise PDFs with LaTeX. Features live preview, auto-compilation, built-in LaTeX command shortcuts, and Docker containerization.

## Features

- 🎨 **WYSIWYG Interface** - User-friendly editor with real-time PDF preview
- ⚡ **Auto-Compile** - Automatic PDF rendering after 2 seconds of inactivity
- 🔧 **Built-in Commands** - Quick access toolbar for 20+ commonly used LaTeX commands
- 📝 **Split View** - Side-by-side editor and PDF preview
- 📄 **Exercise Management** - Each exercise starts on page 1 with independent numbering
- 💾 **Export** - Download PDFs with automatic naming (exercise_N.pdf)
- 🐳 **Docker Support** - Fully containerized with pre-installed LaTeX
- 🚀 **Production Ready** - Deploy to Railway, Google Cloud Run, AWS, and more

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
2. Click "Exercise Title" button or type `\exercisetitle{Exercise 1: Your Title}`
3. Write your problem and solution using LaTeX
4. Use toolbar buttons for quick LaTeX command insertion
5. Wait for auto-compile (2 seconds) or click "Compile" manually
6. Review PDF in the right panel
7. Click "Download PDF" to save

### LaTeX Command Reference

The editor provides quick-access buttons for these commands:

| Command | Output | Description |
|---------|--------|-------------|
| `\BigO{}` | O(n) | Big O notation |
| `\BigOmega{}` | Ω(n) | Big Omega notation |
| `\BigTheta{}` | Θ(n) | Big Theta notation |
| `\floor{}` | ⌊x⌋ | Floor function |
| `\ceil{}` | ⌈x⌉ | Ceiling function |
| `\abs{}` | \|x\| | Absolute value |
| `\set{}` | {1,2,3} | Set notation |
| `\card{}` | \|A\| | Set cardinality |
| `$x \gets y$` | x ← y | Assignment operator |
| `$\AND$` | ∧ | Logical AND |
| `$\OR$` | ∨ | Logical OR |
| `$\NOT$` | ¬ | Logical NOT |
| `\N` | ℕ | Natural numbers |
| `\Z` | ℤ | Integers |
| `\R` | ℝ | Real numbers |
| `\Q` | ℚ | Rational numbers |
| `\C` | ℂ | Complex numbers |
| `\TRUE` | TRUE | Boolean true |
| `\FALSE` | FALSE | Boolean false |
| `\exercisetitle{}` | - | Start new exercise |
| `\exercisepart{}` | - | Add exercise subsection |

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

Click the "Algorithm Block" button to insert a template:

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

1. Click "Download PDF" button
2. Files are automatically named `exercise_N.pdf` based on exercise number
3. PDFs include line numbers, page numbers, and algorithm numbering

---

## Project Structure

```
texer/
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LatexEditor.jsx    # Main editor component
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
- Command toolbar with 20+ pre-configured LaTeX commands
- Auto-compile with debounced compilation (2-second delay)
- Split view: side-by-side editor and PDF preview
- Dynamic exercise numbering
- PDF download functionality
- Error handling and display

**server.js** (Backend)
- `/api/health` - Health check endpoint
- `/api/template` - Serve LaTeX template
- `/api/compile` - Compile full LaTeX document to PDF
- `/api/compile-exercises` - Compile individual exercises separately
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

### POST `/api/compile-exercises`
Compiles individual exercises separately.

**Request Body:**
```json
{
  "content": "Full LaTeX document",
  "exerciseNumbers": [1, 2, 3]
}
```

**Response:**
```json
{
  "results": [
    {
      "exerciseNumber": 1,
      "pdf": "base64-encoded-pdf-data"
    }
  ]
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
     'newcmd': { label: 'New Command', insert: '\\newcommand{}', moveCursor: -1 },
   };
   ```

2. **Update Backend Template** (if needed)
   
   Edit `backend/template.tex`, add command definition:
   ```latex
   \newcommand{\newcmd}[1]{...}
   ```

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
- Wait 2-3 seconds for auto-compile to finish
- Click "Compile" button manually
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
