FROM node:20-alpine

WORKDIR /app

# Install dependencies combined with build to cache efficiently
COPY package*.json ./
RUN npm install

# Copy Source
COPY . .

# Generate Client
RUN npx prisma generate

# Build Frontend
RUN npm run build

# Expose Backend Port
EXPOSE 3001

# Start Backend (which serves frontend)
CMD ["npx", "tsx", "server/index.ts"]
