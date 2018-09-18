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
- https://github.com/felixrieseberg/electron-wix-msi

or maybe:
- https://github.com/electron/windows-installer




//



Version:
- edit in package.json
- edit in splash.html