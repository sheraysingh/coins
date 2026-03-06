FROM python:3.11-slim

WORKDIR /apex-system

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p logs portfolio/reports

EXPOSE 5050

CMD ["python", "main.py"]
