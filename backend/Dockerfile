# Khtar l-version dyal Python
FROM python:3.12-slim

# Siyeb blassa fin ghadi y-t7et l-code f s-serveur
WORKDIR /app

# Copier requirements w installihom
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier l-code kaml
COPY . .

# 7el l-port 8080 bash Back4App y-wsel l-Django
EXPOSE 8080

# L-commande bash y-demarri s-serveur
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8080"]