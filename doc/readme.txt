Version:
- edit in package.json
- edit in splash.html

build an run:
- switch to folder slfp
- npm run electron-build-prod

package for current platform:
- switch to folder slfp
- electron-packager . --overwrite --ignore "(\e2e|\installer|\src|\.editorconfig|\.gitignore|\installerscript.js|\angular.json|\package-lock.json|\README.md|\tsconfig.json|\tslint.json)"

package to asar archive
- switch to folder slfp/Auxfina-plattform/resources
- asar pack app app.asar
- delete app folder

build installer
- run installerscript.js