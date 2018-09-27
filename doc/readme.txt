build an run:
- switch to folder slfp
- npm electron-build

package for current platform:
- switch to folder slfp
- electron-packager . --overwrite

package to asar archive
- switch to folder slfp/Auxfina-plattform/resources
- asar pack app app.asar
- delete app folder


build installer
- run installerscript.js


Version:
- edit in package.json
- edit in splash.html