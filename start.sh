#!/bin/bash
# EagleMart - Start everything

set -e
echo "=== EagleMart ==="
echo ""

# Check Python
if ! command -v python3 &>/dev/null; then
    echo "python3 is not installed."
    echo ""
    echo "Install it first:"
    echo "  Mac:     brew install python3"
    echo "  Windows: https://www.python.org/downloads/"
    echo "  Linux:   sudo apt install python3 python3-venv"
    echo ""
    exit 1
fi

# Check Node
if ! command -v node &>/dev/null; then
    echo "Node.js is not installed."
    echo ""
    echo "Install it first:"
    echo "  Mac:     brew install node"
    echo "  Windows: https://nodejs.org/"
    echo "  Linux:   sudo apt install nodejs npm"
    echo ""
    exit 1
fi

echo "python3: $(python3 --version)"
echo "node:    $(node --version)"
echo ""

# Backend
echo "Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "  Creating virtual environment..."
    if ! python3 -m venv venv 2>/dev/null; then
        echo ""
        echo "ERROR: Failed to create virtual environment."
        echo "On Ubuntu/Debian, install the venv package first:"
        echo "  sudo apt install python3-venv python3-pip"
        echo ""
        exit 1
    fi
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || {
    echo "ERROR: Could not activate virtual environment."
    echo "Try deleting the 'backend/venv' folder and running again."
    exit 1
}
echo "  Installing Python dependencies..."
pip install -q -r requirements.txt

echo "  Starting Flask server..."
python app.py &
BACKEND_PID=$!
cd ..

sleep 2

# Frontend
echo ""
echo "Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "  Installing Node dependencies (this may take a minute)..."
    npm install
fi

echo "  Starting Next.js server..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "==============================="
echo "  EagleMart is running!"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo "  Login:    admin / admin123"
echo "==============================="
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
