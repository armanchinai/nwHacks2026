FROM python:3.12-slim

WORKDIR /app

# Security: non-root user
# RUN useradd -m runner
# USER runner

COPY --chown=runner:runner run.py /app/run.py

CMD ["python", "/app/run.py"]
