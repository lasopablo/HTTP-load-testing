# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install the dependencies
RUN npm install

# Build the app for production with minification
RUN npm run build

# Use an official Nginx runtime as a parent image
FROM nginx:alpine

# Copy the build artifacts from the previous stage
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Define the command to run the app
CMD ["nginx", "-g", "daemon off;"]
