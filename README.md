# Race Day

Race Day is a database of motorsports racing events and is the software that
powers http://raceday.watch. The web application provides a read-only user
interface of motorsports racing events and any associated broadcasts. A separate
user interface allows site owners to add and edit race events.

Data for the raceday.watch site is maintained by the awesome guys at
<a href="https://www.facebook.com/motorsportontv">Motorsport on TV/Online</a>.
They also maintain an alternate view of the coming week's events via a
beautifully formatted Google Doc.

---

## Implementation

The backend uses a PostreSQL database for storage, and a REST API documented via
an OpenAPI specification provides access to the data over HTTP (see `api.yaml`).
A Go-based server implements the REST API, while the user-facing web site is
implemented using <a href="https://vuejs.org/">Vue.js</a> and the administrative
interface is implemented using <a href="https://qooxdoo.org/">Qooxdoo</a>.

---

## Development

Race Day was developed on Linux, but all of the development tools should be
installable and usable on other operating systems as well aside from NVM. The
steps shown below show Linux shell commands, but the corresponding Windows shell
commands should be similar if not identical.

A Makefile in the root of the project provides several targets, and running
`make` will generate several artifacts needed by the various components of the
system. Note that Go executables are output to the `Build` directory in the
project.

### Server

The server is a Go executable which can be built via the `server` Makefile
target. In addition, if using Visual Studio Code, there is a run configuration
available for compiling and debugging it.

The schema for the PostgreSQL database used by the server is defined in
`Schema.sql`.

### User Manager

At the moment, administrative user management is very limited and is handled by
a Go executable which can be built with the `usrmgr` Makefile target. Run the
executable with the `-h` argument to see command line help.

### Web Application

1. Install NVM from https://github.com/nvm-sh/nvm.

2. Install Node 14.

```shell
nvm install 14
```

4. Install the required packages.

```shell
cd Client/Web/Source
npm install
```

5. The serve script can be run to compile and serve the user interface on port
8080 (or whatever is specified in `vue.config.js`).

```shell
./serve.sh
```

### Administrative User Interface

1. Install NVM from https://github.com/nvm-sh/nvm.

2. Install Node 14.

```shell
nvm install 14
```

3. Install the Qooxdoo compiler.

```shell
npm install -g @qooxdoo/compiler
```

4. Install the required packages.

```shell
cd Client/Admin/Source
npm install
```

5. The watch script can be run to re-compile the user interface as you modify
the source code.

```shell
./watch.sh
```
