# Script para construir todo
cat > scripts/build-all.sh << 'EOF'
#!/bin/bash
echo "🏗️ Construyendo todos los servicios..."

cd orchestrator
./mvnw clean package -DskipTests
cd ..

for service in servicios/*; do
    if [ -f "$service/Dockerfile" ]; then
        echo "Construyendo $service..."
        docker build -t $(basename $service):latest $service
    fi
done

echo "✅ Build completado"
EOF
chmod +x scripts/build-all.sh

# Script para iniciar todo
cat > scripts/start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando todos los servicios..."
docker-compose up -d --build
sleep 5
echo "✅ Servicios iniciados"
echo "📊 Estado:"
docker-compose ps
EOF
chmod +x scripts/start-all.sh

# Script para detener todo
cat > scripts/stop-all.sh << 'EOF'
#!/bin/bash
echo "🛑 Deteniendo todos los servicios..."
docker-compose down
echo "✅ Servicios detenidos"
EOF
chmod +x scripts/stop-all.sh

# Script para ver estado
cat > scripts/status.sh << 'EOF'
#!/bin/bash
echo "📊 Estado de los servicios:"
docker-compose ps
echo ""
echo "🌐 Endpoints:"
echo "  Orquestador: http://localhost:8080/api/orquestador/ping"
echo "  Health: http://localhost:8080/api/orquestador/health"
EOF
chmod +x scripts/status.sh

# Script para actualizar submódulos
cat > scripts/update-all-submodules.sh << 'EOF'
#!/bin/bash
echo "🔄 Actualizando submódulos..."
git submodule update --remote --merge
echo "✅ Submódulos actualizados"
EOF
chmod +x scripts/update-all-submodules.sh