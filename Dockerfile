# Use Node.js LTS
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Expose default port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]