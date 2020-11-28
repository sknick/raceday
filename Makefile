all: python-api server

python-api:
	java -jar Third_Party/swagger-codegen-cli-3.0.23.jar generate -l python -c Client/API/Python/api.conf -o Client/API/Python/Build -i api.yaml
	cp Client/API/Python/Source/requirements.txt Client/API/Python/Build/requirements.txt

go-model:
	java -jar Third_Party/swagger-codegen-cli-3.0.23.jar generate -l go-server -c Server/api.conf -o Server/Source/raceday -i api.yaml
	mv Server/Source/raceday/go/* Server/Source/raceday/model
	rm -rf Server/Source/raceday/go
	rm -rf Server/Source/raceday/api

server: go-model
	mkdir -p Build
	cd Server/Source && go build -o ../../Build/raceday && chmod 755 ../../Build/raceday

web_ui:
	cd Client/Web_UI/Source && npm run build

deployment:
	cd Deployments/x51 && docker-compose build
