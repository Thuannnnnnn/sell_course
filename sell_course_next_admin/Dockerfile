# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .
RUN npm install sharp
# Build the application
RUN npm run build

# Expose the port the application runs on
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "run", "start"]