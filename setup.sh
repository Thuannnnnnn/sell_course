#!/bin/bash

# Sell Course Development Setup Script
# This script helps set up the development environment

set -e  # Exit on any error

echo "🎓 Sell Course - Development Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version 18+ is recommended. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js not found! Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if Python is installed
check_python() {
    print_status "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python3 not found! Please install Python 3.9+ from https://python.org/"
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found! Install Docker for easier database setup: https://docker.com/"
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend (NestJS)..."
    cd sell_course_nest
    
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please update .env file with your configuration!"
        else
            print_warning "No .env.example found. Please create .env file manually."
        fi
    fi
    
    print_status "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed!"
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend (Next.js)..."
    cd Sell_course_next
    
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        echo "NEXTAUTH_URL=http://localhost:3000" > .env.local
        echo "NEXTAUTH_SECRET=your-nextauth-secret-key" >> .env.local
        echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
        print_warning "Please update .env.local file with your configuration!"
    fi
    
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed!"
    
    cd ..
}

# Install admin dependencies
setup_admin() {
    print_status "Setting up admin dashboard..."
    cd sell_course_next_admin
    
    if [ ! -f ".env.local" ]; then
        print_status "Creating admin .env.local file..."
        echo "NEXTAUTH_URL=http://localhost:5000" > .env.local
        echo "NEXTAUTH_SECRET=your-nextauth-secret-key" >> .env.local
        echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
        print_warning "Please update admin .env.local file with your configuration!"
    fi
    
    print_status "Installing admin dependencies..."
    npm install
    print_success "Admin dependencies installed!"
    
    cd ..
}

# Setup AI service
setup_ai_service() {
    print_status "Setting up AI Quiz Generator service..."
    cd quiz-generator-api
    
    if [ ! -f ".env" ]; then
        print_status "Creating AI service .env file..."
        echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env
        echo "GEMINI_MODEL=gemini-pro" >> .env
        echo "GEMINI_MAX_TOKENS=2000" >> .env
        echo "GEMINI_TEMPERATURE=0.7" >> .env
        print_warning "Please add your Google Gemini API key to .env file!"
    fi
    
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    
    print_status "Installing Python dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    print_success "AI service dependencies installed!"
    
    cd ..
}

# Setup database with Docker
setup_database() {
    if command -v docker &> /dev/null; then
        print_status "Setting up databases with Docker..."
        cd sell_course_nest
        
        if [ -f "docker-compose.yml" ]; then
            print_status "Starting PostgreSQL and Redis..."
            docker-compose up -d postgres redis
            print_success "Databases started!"
        else
            print_warning "No docker-compose.yml found for database setup"
        fi
        
        cd ..
    else
        print_warning "Docker not available. Please setup PostgreSQL and Redis manually."
        print_status "PostgreSQL: Create database 'sell_course'"
        print_status "Redis: Default configuration should work"
    fi
}

# Main setup function
main() {
    echo
    print_status "Starting development environment setup..."
    echo
    
    # Check prerequisites
    check_nodejs
    check_python
    check_docker
    
    echo
    print_status "Installing dependencies for all services..."
    echo
    
    # Setup all services
    setup_backend
    setup_frontend
    setup_admin
    setup_ai_service
    
    echo
    print_status "Setting up databases..."
    setup_database
    
    echo
    print_success "🎉 Setup completed!"
    echo
    echo "Next steps:"
    echo "1. Update .env files with your configuration"
    echo "2. Get a Google Gemini API key: https://makersuite.google.com/app/apikey"
    echo "3. Setup PayOS account for payments: https://payos.vn/"
    echo "4. Setup Azure Storage for file uploads"
    echo
    echo "To start development:"
    echo "# Start backend"
    echo "cd sell_course_nest && npm run start:dev"
    echo
    echo "# Start frontend (new terminal)"
    echo "cd Sell_course_next && npm run dev"
    echo
    echo "# Start admin dashboard (new terminal)"
    echo "cd sell_course_next_admin && npm run dev"
    echo
    echo "# Start AI service (new terminal)"
    echo "cd quiz-generator-api && source venv/bin/activate && python main.py"
    echo
    print_success "Happy coding! 🚀"
}

# Run main function
main