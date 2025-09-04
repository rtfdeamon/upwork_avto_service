FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY python/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY python /app/python
EXPOSE 4000
CMD ["uvicorn", "python.api.app:app", "--host", "0.0.0.0", "--port", "4000"]

