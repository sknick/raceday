all: javascript-model python-api server

python-api:
	java -jar Third_Party/Swagger_Codegen/swagger-codegen-cli-3.0.23.jar generate -l python -c Client/API/Python/api.conf -o Client/API/Python/Build -i api.yaml
	cp Client/API/Python/Source/requirements.txt Client/API/Python/Build/requirements.txt

go-model:
	java -jar Third_Party/Swagger_Codegen/swagger-codegen-cli-3.0.23.jar generate -l go-server -c Server/api.conf -o Server/Source/raceday -i api.yaml
	mv Server/Source/raceday/go/* Server/Source/raceday/model
	rm -rf Server/Source/raceday/go
	rm -rf Server/Source/raceday/api

javascript-model:
	java -jar Third_Party/Swagger_Codegen/swagger-codegen-cli-3.0.23.jar generate -l javascript -t Third_Party/Swagger_Codegen/javascript -c Client/Admin/Source/api.conf -o Client/Admin/Source -i api.yaml

server: go-model
	mkdir -p Build
	cd Server/Source && go build -o ../../Build/raceday && chmod 755 ../../Build/raceday

web:
	cd Client/Web/Source && npm run build

admin:
	cd Client/Admin/Source && qx deploy --target build --clean

deployment:
	cd Deployments/x51 && docker-compose build
