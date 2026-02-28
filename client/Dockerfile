FROM node:20-alpine

WORKDIR /app

# Copy package files from the app folder
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from the app folder
COPY app/ .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
