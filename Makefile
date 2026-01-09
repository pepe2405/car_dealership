.PHONY: start-backend start-frontend start-pdf-service start-all install stop pdf-venv

PDF_DIR=pdf-service
VENV=$(PDF_DIR)/venv

ifeq ($(OS),Windows_NT)
	PYTHON=$(VENV)/Scripts/python
	PIP=$(VENV)/Scripts/pip
else
	PYTHON=$(VENV)/bin/python
	PIP=$(VENV)/bin/pip
endif

start-backend:
	npm run dev:backend

start-frontend:
	npm run dev:frontend

pdf-venv:
	@if [ ! -d "$(VENV)" ]; then \
		echo "🔧 Creating Python virtual environment..."; \
		python -m venv $(VENV); \
		$(PIP) install --upgrade pip; \
		$(PIP) install -r $(PDF_DIR)/requirements.txt; \
	else \
		echo "Python venv already exists."; \
	fi

start-pdf-service: pdf-venv
	cd $(PDF_DIR) && ../$(PYTHON) -m uvicorn pdf_generator:app --host 0.0.0.0 --port 8001 --reload

start-all:
	npx concurrently "make start-backend" "make start-frontend" "make start-pdf-service"

install:
	npm install --prefix backend
	npm install --prefix frontend
	$(PIP) install -r $(PDF_DIR)/requirements.txt

stop:
	pkill -f "npm run dev:backend" || true
	pkill -f "npm run dev:frontend" || true
	pkill -f "uvicorn" || true
