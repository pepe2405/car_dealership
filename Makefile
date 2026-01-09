.PHONY: start-backend start-frontend start-pdf-service start-all install stop pdf-venv

PDF_DIR=pdf-service
VENV=$(PDF_DIR)/venv
PYTHON=$(VENV)/bin/python
PIP=$(VENV)/bin/pip
UVICORN=$(VENV)/bin/uvicorn

start-backend:
	npm run dev:backend

start-frontend:
	npm run dev:frontend

pdf-venv:
	@if [ ! -d "$(VENV)" ]; then \
		python3 -m venv $(VENV); \
		$(PIP) install --upgrade pip; \
		$(PIP) install -r $(PDF_DIR)/requirements.txt; \
	else \
		echo "Python venv already exists"; \
	fi

start-pdf-service: pdf-venv
	cd $(PDF_DIR) && ./venv/bin/python -m uvicorn pdf_generator:app --host 0.0.0.0 --port 8001 --reload

start-all:
	concurrently "make start-backend" "make start-frontend" "make start-pdf-service"

install:
	npm install --prefix backend
	npm install --prefix frontend

stop:
	pkill -f "npm run dev:backend" || true
	pkill -f "npm run dev:frontend" || true
	pkill -f "uvicorn" || true
