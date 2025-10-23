#!/bin/bash

echo "🚀 Setting up LaTeX Exercise Editor..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Export UID and GID for docker-compose to run as current user
export UID=$(id -u)
export GID=$(id -g)

# Build and start the application
echo "📦 Building Docker image (this may take a few minutes)..."
docker compose build

echo "🎉 Setup complete!"
echo ""
echo "To start the application, run:"
echo "  docker compose up"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
