# Use the official Node.js image as the base image
FROM oven/bun:1.2-debian AS base

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY . .

# Install the dependencies
# Expose the port specified in the .env file
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y unzip
# Run different commands based on the system architecture
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    # For x86_64 here
    elif [[ "$ARCH" == i*86 ]]; then \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    # For 32-bit x86 here
    elif [ "$ARCH" = "aarch64" ]; then \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
    # For aarch64 here
    else \
    echo "Unsupported architecture: $ARCH"; \
    # For other unsupported architectures
    fi
RUN unzip awscliv2.zip
RUN ./aws/install
RUN apt-get install less
RUN bun install
RUN bunx vite build

# Copy the rest of the application code to the working directory
CMD ["./setup.sh"]