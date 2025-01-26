# Dockerfile for running the Next.js application in a container
# Node.js as the base image
FROM node:18-alpine

# Seting up the working directory in the container
WORKDIR /app

# Copying the package.json and package-lock.json (if available)
COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying the rest of the source code 
COPY . .

# Building the application
RUN npm run build

# Expose the default port for browser accessibility
EXPOSE 3000

# Kickstarting the Next.js application
CMD ["npm", "start"]