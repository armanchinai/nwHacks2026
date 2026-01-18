FROM python:3.12-slim

WORKDIR /app

# Security: whole environment is a sandbox, so not needed
# RUN useradd -m runner
# USER runner

COPY --chown=runner:runner run.py /app/run.py

CMD ["python", "/app/run.py"]