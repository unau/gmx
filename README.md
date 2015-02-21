# gmx
my own tool for synchronizing Google Apps Script using gas-manager

## Install

```shell
npm install https://github.com/unau/gmx.git
```

## Getting Started

### Prepare Credential Info
gmx need the credential information for your account. gmx read the information from npm config.
You may configure your cledential information as below:

```shell
npm config set gmx:cleint_id "*** your cleint_id ***"
npm config set gmx:cleint_secret "*** your cleint_secret ***"
npm config set gmx:refresh_token "*** your refresh_token ***"
```

## Prepare Setting File
The path of the setting file for gmxd (server) and gmx (client) is `./gmx.json`.
You can copy `./gmx.skel.json` into `./gmx.json`, then configure it.
You have to specify the forests to suit your environment.

```json
{
  "gmxd" : {
      "port" : 19876
        },

  "forests" : [
      "/home/takeyuki/gas"
        ],

  "groups" : {
      "lib" : [ "lib1", "lib2" ]
        }
	}

```

**forest** is the directory that contains one or more of the source files (named **tree**) to be managed by gmx.

## Start gmxd (local server)

```shell
npm start
```

## CLI Commands (local client)

#### Stop Server
    $ gmx stop

#### Reset Server
    $ gmx reset

#### Show Server Status
    $ gmx status

#### Download Command

The download command is downloading GAS Project into the local file system.

##### Download GAS Projects to the Station Directry

    $ gmx pull <target>

`<target>` is a name specifying a project or a group of projects.
the sources of the projects are stored into **stations**, by default.
While **port** is the main source directory,
**station** is the arrival directory of the downloaded source.
Normally , you'll develop sources on the **port**. **Station** is used to prevent unintended overwriting.

##### Download GAS Projects to the Port Directry

    $ gmx pull --pass <target>

or

    $ gmx pull -p <target>

With `--pass` option, you can download projects to **port** directries, instead of **station** directries.

#### Upload Command

The upload command is uploading your local files to Google Drive.

    $ gmx push <target>

`<target>` is a name specifying a project or a group of projects.

## Release History

## License
Copyright (c) 2015 Takeyuki Kojima
Licensed under the MIT license.
