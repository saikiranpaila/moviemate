FROM python:3.10.16-alpine3.21

ENV AWS_REGION=us-east-1
ENV SOURCE_BUCKET=src.22122024.bucket
ENV TARGET_BUCKET=dest.22122024.bucket
ENV SOURCE_KEY=f3a02cef4b63dc17b99ce4a01b5098fe/input.mp4
ENV MOVIE_ID=f3a02cef4b63dc17b99ce4a01b5098fe

# Install dependencies and FFmpeg
RUN apk add --no-cache ffmpeg

# Set the working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt /app/

# Install Requirements
RUN pip install -r requirements.txt

# Copy the Python script to the container
COPY main.py /app/

# Set the command to run the script
CMD ["python3", "main.py"]
