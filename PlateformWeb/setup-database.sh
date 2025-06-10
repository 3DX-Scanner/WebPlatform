#!/bin/bash

echo "📦 Démarrage de MariaDB avec Docker Compose..."
docker-compose up -d

echo "⏳ Attente que MariaDB soit prêt..."
until docker exec mariadb mysqladmin ping -h "localhost" --silent; do
  sleep 1
done
echo "✅ MariaDB est prêt."

echo "🔐 Attribution des droits à l'utilisateur 'admin'..."
docker exec -i mariadb mysql -uroot -proot <<EOF
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF

echo "✅ Droits accordés."

echo "📄 Exécution de la migration Prisma..."
npx prisma migrate dev --name init

echo "⏳Lancement de redis..."

docker run -d --name redis -p 6379:6379 redis

echo "🎉 Setup terminé avec succès."
