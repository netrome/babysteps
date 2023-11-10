# Stage 1: Build the front-end
FROM node:18 AS frontend-builder
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm install
COPY app/ ./
RUN npm run build

# Stage 2: Build the back-end
FROM rust:1.70 AS backend-builder
WORKDIR /usr/src/babysteps
COPY . .
# Install musl-tools for the musl target
RUN apt-get update && apt-get install -y musl-tools
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --no-default-features --features=postgres --target=x86_64-unknown-linux-musl

# Stage 3: Set up the final image
FROM alpine:latest
# Install the necessary dependencies
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the front-end build
COPY --from=frontend-builder /app/public /app/public
COPY --from=frontend-builder /app/static /app/static
# Copy the back-end build
COPY --from=backend-builder /usr/src/babysteps/target/x86_64-unknown-linux-musl/release/babysteps .

# Set environment variables
ENV BS_STATIC_ROOT=/app/static
ENV BS_BUNDLE_ROOT=/app/public
ENV BS_PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Run the binary
CMD ["./babysteps"]
