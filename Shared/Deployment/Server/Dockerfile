FROM ubuntu:18.04 AS builder

WORKDIR /
RUN apt --assume-yes update && \
    apt --assume-yes install nodejs         \
                             npm            \
                             openjdk-11-jre \
                             wget

WORKDIR /
RUN npm install -g @qooxdoo/compiler

WORKDIR /usr
RUN wget -q --no-check-certificate https://golang.org/dl/go1.14.6.linux-amd64.tar.gz
RUN tar -xvf ./go1.14.6.linux-amd64.tar.gz
RUN rm -f ./go1.14.6.linux-amd64.tar.gz
RUN ln -s /usr/go/bin/go /usr/bin/go

WORKDIR /RaceDay
COPY ./ .
RUN make server
RUN make web
RUN make admin


FROM ubuntu:18.04

RUN apt --assume-yes update

WORKDIR /usr/bin
COPY --from=builder /RaceDay/Build/raceday .

WORKDIR /etc
COPY Shared/Deployment/raceday.conf .

WORKDIR /var/www/ui_root
COPY --from=builder /RaceDay/Client/Web/Source/dist .

WORKDIR /var/www/admin_ui_root
COPY --from=builder /RaceDay/Client/Admin/Source/compiled/deploy .
