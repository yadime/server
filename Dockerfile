# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of your application code
COPY . .

# Expose the port your app uses
EXPOSE 3002

# Start the application
CMD ["node", "index.js"]
