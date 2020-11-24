server:
	java -jar Third_Party/swagger-codegen-cli-3.0.23.jar generate -l go-server -c Server/api.conf -o Server/Source/raceday -i api.yaml
	mv Server/Source/raceday/go/* Server/Source/raceday/model
	rm -rf Server/Source/raceday/go
	rm -rf Server/Source/raceday/api
