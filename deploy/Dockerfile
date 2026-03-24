FROM node:18-alpine AS base

WORKDIR /app

# Copy project files
COPY package.json vibeorg.config.json ./
COPY dashboard/package.json ./dashboard/
COPY scheduler/package.json ./scheduler/

# Install dependencies
RUN npm install --workspace=dashboard --production
RUN cd scheduler && npm install --production

# Copy all source files
COPY . .

# Build the dashboard
RUN npm run build --workspace=dashboard

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built dashboard and all project files
COPY --from=base /app ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Default: run the dashboard
# Use docker-compose to also run the scheduler
CMD ["npm", "run", "start", "--workspace=dashboard"]
