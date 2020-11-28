FROM ubuntu:18.04 AS builder

WORKDIR /
# Note that gsfonts is required by apas-xpdf, but alien can't install it as a dependency automatically
RUN apt --assume-yes update && \
    apt --assume-yes install nodejs         \
                             npm            \
                             openjdk-11-jre \
                             wget

#WORKDIR /
#RUN npm install -g @qooxdoo/compiler

WORKDIR /usr
RUN wget -q --no-check-certificate https://golang.org/dl/go1.14.6.linux-amd64.tar.gz
RUN tar -xvf ./go1.14.6.linux-amd64.tar.gz
RUN rm -f ./go1.14.6.linux-amd64.tar.gz
RUN ln -s /usr/go/bin/go /usr/bin/go

WORKDIR /RaceDay
COPY ./ .
RUN make server
RUN make web_ui


FROM ubuntu:18.04

RUN apt --assume-yes update

WORKDIR /usr/bin
COPY --from=builder /RaceDay/Build/raceday .

WORKDIR /etc
COPY Shared/Deployment/raceday.conf .

WORKDIR /var/www/raceday
COPY --from=builder /RaceDay/Client/Web_UI/Source/dist .
