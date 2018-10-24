# ReactJS AntMiner frontend

## Installing ReactJS dependencies
### Install Node.js
Go to [Node Download](https://nodejs.org/en/), you should see links to download Node.js. Click on the download link of your choice. Follow the subsequent instructions to install Node.js and npm. If you've already installed Node.js, that's okay, do it anyway.


### Install ReactJS
Go to the folder where you cloned this repository and type: **npm install** that will download all the required libraries.

## Building the source
You can find the source code into the *src/* directory and you can modify it. For testing in a real miner you can modify the variable *urlPrefix* in *App.js* and then you can specify the URL of your miner, ie: *http://192.168.0.100* that will be very helpful for working without having to upload the html and JS to the miner.

It's necessary to download, install and enable the [allow-control-allow-origi](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi) chrome extension to allow sending Ajax requests to a remote URL.

When you have made your changes to the code, you can test the application running the command: **npm run start** that will create a HTTP server so you can check your application in the URL *http://localhost:3000*

This application will be automatically imported compiled and packaged as part of the firmware update by buildroot, you can set the default path of this repo in buildroot with local.mk by setting BM_FRONTEND_OVERRIDE_SRCDIR to override the source location during development.
