# Single stage build
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app for production
RUN npm run build

# Expose port 4173 (default Vite preview port)
EXPOSE 4173

# Start the app using Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]