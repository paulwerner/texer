# System Architecture

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│                                                              │
│    ┌────────────────────────────────────────────────────┐    │
│    │                 React Frontend                     │    │
│    │                   (Port 3000)                      │    │
│    │                                                    │    │
│    │  ┌──────────────┐  ┌─────────────┐  ┌───────────┐  │    │
│    │  │ LaTeX Editor │  │ PDF Preview │  │  Toolbar  │  │    │
│    │  └──────────────┘  └─────────────┘  └───────────┘  │    │
│    │                                                    │    │
│    │  ┌──────────────────────────────────────────────┐  │    │
│    │  │               Axios HTTP Client              │  │    │
│    │  └──────────────────────────────────────────────┘  │    │
│    └────────────────────────────────────────────────────┘    │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTP/REST
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                       Docker Container                      │
│                   (node:22-slim + TeXLive)                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Express Backend (Port 5000)            │   │
│   │                                                     │   │
│   │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐   │   │
│   │  │ API Routes  │  │   pdflatex   │  │  File Mgr │   │   │
│   │  │             │  │  Compiler    │  │           │   │   │
│   │  │ /compile    │  │              │  │   /tmp    │   │   │
│   │  │ /template   │─▶│ Shell Exec   │◀─│  cleanup  │   │   │
│   │  │ /health     │  │              │  │           │   │   │
│   │  └─────────────┘  └──────────────┘  └───────────┘   │   │
│   │                                                     │   │
│   │  ┌──────────────────────────────────────────────┐   │   │
│   │  │          LaTeX Template (.tex)               │   │   │
│   │  │   • Custom commands                          │   │   │
│   │  │   • Exercise structure                       │   │   │
│   │  │   • Algorithm environments                   │   │   │
│   │  └──────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.js
  └── LatexEditor.jsx
        ├── Header
        │     ├── Exercise Number Input
        │     ├── View Toggle Button
        │     ├── Compile Button
        │     └── Download Button
        │
        ├── Command Toolbar
        │     ├── LaTeX Command Buttons (20+)
        │     └── Algorithm Block Button
        │
        └── Main Content
              ├── Editor Panel (Card)
              │     └── Textarea (monospace)
              │
              └── Preview Panel (Card)
                    ├── Error Display
                    └── PDF Iframe
```

### Backend Structure

```
server.js
  ├── Middleware
  │     ├── CORS
  │     └── JSON Parser
  │
  ├── API Routes
  │     ├── GET  /api/health
  │     ├── GET  /api/template
  │     ├── POST /api/compile
  │     └── POST /api/compile-exercises
  │
  ├── LaTeX Compiler
  │     ├── createTempDirectory()
  │     ├── writeTexFile()
  │     ├── execPdflatex() (x2)
  │     ├── readPdfFile()
  │     └── cleanup()
  │
  └── File System
        └── /tmp/latex/{jobId}/
              ├── document.tex
              ├── document.pdf
              ├── document.log
              └── document.aux
```

## Data Flow

### Compilation Flow

```
1. User Types in Editor
   │
   ├─▶ Content stored in React state
   │
   └─▶ Debounce timer starts (2 seconds)

2. Timer Expires
   │
   └─▶ Trigger compileLatex()

3. Frontend: Prepare Request
   │
   ├─▶ Inject content into template
   ├─▶ Replace exercise number
   └─▶ POST to /api/compile

4. Backend: Receive Request
   │
   ├─▶ Generate unique jobId (UUID)
   ├─▶ Create temp directory: /tmp/latex/{jobId}/
   ├─▶ Write document.tex
   │
   └─▶ Execute pdflatex (first pass)
       │
       └─▶ Execute pdflatex (second pass for references)

5. Backend: Handle Result
   │
   ├─▶ Success
   │   ├─▶ Read document.pdf
   │   ├─▶ Send PDF blob to frontend
   │   └─▶ Schedule cleanup (5 seconds)
   │
   └─▶ Error
       ├─▶ Read document.log
       ├─▶ Send error details to frontend
       └─▶ Schedule cleanup

6. Frontend: Display Result
   │
   ├─▶ Success
   │   ├─▶ Create Blob URL
   │   ├─▶ Update PDF iframe
   │   └─▶ Revoke old Blob URL
   │
   └─▶ Error
       └─▶ Display error message in preview panel

7. User Downloads PDF
   │
   └─▶ Create download link from Blob URL
       └─▶ Trigger browser download
```

## Technology Stack Details

### Frontend Stack

```
┌──────────────────────────────────┐
│            React 19              │
│  ┌────────────────────────────┐  │
│  │   Components Layer         │  │
│  │  • Functional Components   │  │
│  │  • React Hooks (useState,  │  │
│  │    useEffect, useRef)      │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │   Styling Layer            │  │
│  │  • TailwindCSS (utility)   │  │
│  │  • shadcn/ui (components)  │  │
│  │  • Custom CSS variables    │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │   HTTP Layer               │  │
│  │  • Axios                   │  │
│  │  • Blob handling           │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Backend Stack

```
┌───────────────────────────────────┐
│         Node.js + Express         │
│  ┌─────────────────────────────┐  │
│  │   Web Framework             │  │
│  │  • Express routes           │  │
│  │  • Middleware (CORS, JSON)  │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │   Process Management        │  │
│  │  • child_process.exec       │  │
│  │  • Promise handling         │  │
│  │  • Timeout handling         │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │   File System               │  │
│  │  • fs.promises              │  │
│  │  • Temp directory mgmt      │  │
│  │  • Cleanup scheduling       │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │   LaTeX System              │  │
│  │  • pdflatex binary          │  │
│  │  • TeXLive packages         │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

## Network Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │         │   Docker     │         │    File      │
│              │         │  Container   │         │   System     │
│              │         │              │         │              │
│  React App   │ ◀────▶  │   Express    │ ◀────▶  │  /tmp/latex  │
│  Port 3000   │  HTTP   │  Port 5000   │  FS     │  {jobId}/    │
│              │         │              │         │  *.tex       │
│              │         │   pdflatex   │         │  *.pdf       │
│              │         │              │         │  *.log       │
└──────────────┘         └──────────────┘         └──────────────┘
```

## Security Considerations

### Current Implementation

```
✅ CORS enabled (controlled origins)
✅ Request size limits (50MB)
✅ Timeout handling (30 seconds)
✅ Temporary file cleanup
✅ UUID-based job IDs (no path traversal)
✅ Non-stop mode for pdflatex (no user interaction)
```

### Potential Enhancements

```
⚠️  Rate limiting (DoS protection)
⚠️  Input sanitization (LaTeX injection)
⚠️  User authentication
⚠️  Resource quotas (CPU, memory)
⚠️  Sandboxing (restricted file access)
```

## Scalability Considerations

### Current Design
- Single-server architecture
- In-memory job management
- Local file system storage

### Scalability Options
1. **Horizontal Scaling**
   - Load balancer
   - Multiple container instances
   - Shared storage (NFS, S3)

2. **Queue System**
   - Redis/RabbitMQ for job queue
   - Worker processes for compilation
   - Job status tracking

3. **Caching**
   - Redis for compiled PDFs
   - Cache based on content hash
   - Reduce compilation load

4. **Microservices**
   - Separate compilation service
   - API gateway
   - Independent scaling

## Deployment Options

### Development (Current)
```
docker compose up
  ├─▶ Frontend: http://localhost:3000
  └─▶ Backend:  http://localhost:5000
```

### Production Options

**Option 1: Single Server**
```
Nginx Reverse Proxy
  ├─▶ Frontend (static files)
  └─▶ Backend API (proxy to :5000)
```

**Option 2: Cloud Platform**
```
Frontend: Vercel/Netlify
Backend:  Heroku/Railway/Render
Container: AWS ECS/Google Cloud Run
```

**Option 3: Kubernetes**
```
Deployment
  ├─▶ Frontend pods (3 replicas)
  ├─▶ Backend pods (3 replicas)
  └─▶ LaTeX compiler pods (5 replicas)
Service
  └─▶ Load Balancer
```

## Performance Metrics

### Expected Performance
- **Compilation Time**: 1-3 seconds
- **Auto-Compile Delay**: 2 seconds
- **Frontend Response**: <100ms
- **PDF Preview**: Instant (blob URL)

### Resource Usage
- **Memory**: ~500MB per container
- **CPU**: Burst during compilation
- **Disk**: ~1GB for LaTeX, temp files auto-cleaned

---

This architecture provides a solid foundation for a TeXer, the LaTeX exercise editor with room for future enhancements and scaling!
