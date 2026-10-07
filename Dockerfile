# Dockerfile for running the Next.js application in a container
# Next.js 16 requires Node.js 20.9 or newer
FROM node:22-alpine

# Setting up the working directory in the container
WORKDIR /app

# Copying the package.json and package-lock.json
COPY package*.json ./

# Installing dependencies from the lockfile
RUN npm ci

# Copying the rest of the source code
COPY . .

# Building the application
RUN npm run build

# Expose the default port for browser accessibility
EXPOSE 3000

# Kickstarting the Next.js application
CMD ["npm", "start"]
