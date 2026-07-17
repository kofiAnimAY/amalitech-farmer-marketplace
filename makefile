PYTHON ?= python
PIP ?= pip
NPM ?= npm
VITE_BASE ?= http://localhost:8000

.PHONY: help install install-backend install-frontend run-backend run-frontend dev test

help:
	@echo "Makefile targets:"
	@echo "  install            Install both backend and frontend dependencies"
	@echo "  install-backend    Install Python backend dependencies (pip)"
	@echo "  install-frontend   Install frontend dependencies (npm)"
	@echo "  run-backend        Start backend server (python app.py)"
	@echo "  run-frontend       Start frontend dev server (Vite)"
	@echo "  dev                Start backend (background) then frontend (foreground)"
	@echo "  test               Run Python unit tests (pytest)"

install: install-backend install-frontend

install-backend:
	@echo "Installing Python requirements..."
	$(PIP) install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies from package-lock..."
	$(NPM) ci

run-backend:
	@echo "Starting backend on http://0.0.0.0:8000"
	$(PYTHON) app.py

run-frontend:
	@echo "Starting frontend (Vite) with API base: $(VITE_BASE)"
	VITE_API_BASE_URL=$(VITE_BASE) $(NPM) run dev

dev:
	@echo "Starting backend in background and frontend in foreground"
	@$(PYTHON) app.py & \
	 sleep 1; \
	 VITE_API_BASE_URL=$(VITE_BASE) $(NPM) run dev

test:
	@echo "Running tests..."
	pytest -q
