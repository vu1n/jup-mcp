.PHONY: install dev start test lint clean

# Install dependencies
install:
	npm install

# Run development server with hot reload
dev:
	npm run dev

# Start production server
start:
	npm start

# Run tests
test:
	npm test

# Run linter
lint:
	npm run lint

# Clean build artifacts
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage

# Help command
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Run development server with hot reload"
	@echo "  make start      - Start production server"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linter"
	@echo "  make clean      - Clean build artifacts" 