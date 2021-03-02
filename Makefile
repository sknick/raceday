all: javascript-model python-api server usrmgr

python-api:
	java -jar Third_Party/Swagger_Codegen/swagger-codegen-cli-3.0.23.jar generate -l python -c Client/API/Python/api.conf -o Client/API/Python/Build -i api.yaml
	cp Client/API/Python/Source/requirements.txt Client/API/Python/Build/requirements.txt
	rm -r Client/API/Python/Build/test
	rm Client/API/Python/Build/git_push.sh
	rm Client/API/Python/Build/test-requirements.txt
	rm Client/API/Python/Build/tox.ini
	rm Client/API/Python/Build/.travis.yml

go-model:
	java -jar Third_Party/Swagger_Codegen/swagger-codegen-cli-3.0.23.jar generate -l go-server -t Third_Party/Swagger_Codegen/go-server -c Server/api.conf -o Server/Source/raceday -i api.yaml
	mkdir -p Server/Source/raceday/model
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

usrmgr:
	cd Misc/UserManager/Source && go build -o ../../../Build/usrmgr && chmod 755 ../../../Build/usrmgr

deployment:
	cd Deployments/raceday.watch && docker-compose build
	cd Deployments/raceday.watch && docker-compose push

clean:
	rm -r Build
	rm -r Client/API/Python/Build
