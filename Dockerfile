# Build stage
FROM golang:1.24-alpine AS builder

# Install SSL certificates and git
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

# Install runtime dependencies (SSL certs for Neon DB connection)
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/main .

# Copy migrations and .env
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/.env ./.env

# Expose backend port
EXPOSE 8080

# Run the binary
CMD ["./main"]

