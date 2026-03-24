# Use official Node LTS
FROM node:20

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Build TypeScript
RUN npx tsc

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "dist/app.js"]