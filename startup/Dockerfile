FROM python:3.10.16-alpine3.21
WORKDIR /app
ENV MONGO_HOST=localhost
ENV MONGO_PORT=27017
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY main.py /app/
CMD ["python3", "main.py"]
