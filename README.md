# gmx
my own tool for synchronizing Google Apps Script using gas-manager


## Getting Started

## Prepare credential File
gmx need the credential file for your account. The path of the credential file is `./credential.json`.
You can copy `./credential.skel.json` into `./credential.json`, then configure it.

## Prepare Setting File
The path of the setting file for gmxd (server) and gmx (client) is `./gmx.json`.
You can copy `./gmx.skel.json` into `./gmx.json`, then configure it.

## Start gmxd (local server)

```shell
node start_gmxd.js
```

### Commands

#### Stop server (gmxd)
    $ gmx stop

#### Reset server (gmxd)
    $ gmx reset

#### Show Status
    $ gmx status

#### List projects
    $ gmx list <target>

#### Pull projects
    $ gmx pull <target>


## Release History

## License
Copyright (c) 2015 Takeyuki Kojima
Licensed under the MIT license.
