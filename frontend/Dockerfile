# Step 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the build using a lightweight server
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Debug: List dist contents
RUN ls -la ./dist

EXPOSE 8080
ENV PORT=8080

# Use PORT environment variable
CMD ["sh", "-c", "serve -s dist -l $PORT"]