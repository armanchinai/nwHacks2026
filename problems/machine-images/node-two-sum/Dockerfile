FROM node:20-slim

WORKDIR /app

# Security: non-root user
RUN useradd -m runner
USER runner

# Entry script
COPY --chown=runner:runner run.js /app/run.js

# Default command (Fly will use this)
CMD ["node", "/app/run.js"]
