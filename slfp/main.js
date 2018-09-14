const { app, BrowserWindow } = require('electron');
const storage = require('electron-json-storage');
const menu = require('./menu');
const electron = require('electron');

let win;
let saveTimeout = null;

function startApp () {

  // create splash-Window
  splash = new BrowserWindow({
    width: 640,
    height: 226,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false
  });
  splash.loadURL(`file://${__dirname}/splash.html`);

  // Load preferences to get coordinates of last session
  storage.has('preferences', (error, has) => {
    if (error) console.log(error);
    if (has) {
      storage.get('preferences', (error, preferences) => {
        if (error) {
          console.log(error);
        } else if (preferences) {
          openMainWindow(preferences.width, preferences.height, preferences.x, preferences.y, preferences.maximized);
        }
      });
    } else {
      let size = electron.screen.getPrimaryDisplay().workAreaSize;
      openMainWindow(size.width, size.height);
    }
  });

  // install main menu
  menu.installMainMenu(win);
}

// Create window on electron intialization
app.on('ready', startApp);

//Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app.on('activate', function () {
//   // macOS specific close process
//   if (win === null) {
//     startApp()
//   }
// });

function openMainWindow(width, height, x, y, maximized) {

  // Create the browser window.
  win = new BrowserWindow({
    width: width,
    height: height,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,
    show: false,
    x: x,
    y: y,
    minWidth: 1024,
    minHeight: 768
  });
  win.loadURL(`file://${__dirname}/dist/slfp/index.html`);

  win.on('maximize', function () {
    savePreferences();
  });

  win.on('unmaximize', function () {
    savePreferences();
  });

  win.on('resize', function () {
    savePreferences();
  });

  win.on('move', function () {
    savePreferences();
  });

  win.on('close', function () {
    if (saveTimeout) {
      saveTimeout.unref();
    }
  });

  win.on('closed', function () {
    win = null
  });

  win.once('ready-to-show', () => {
    splash.destroy();
    if (maximized) {
      win.maximize();
    }
    win.show();
  });
}

function savePreferences() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(()=>{
    if (win) {  // maybe we are too late to save
      let bounds = win.getBounds();
      let preferences = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        maximized: win.isMaximized()
      };
      storage.set('preferences', preferences, (error)=>{
        if (error) console.log(error);
      });
      saveTimeout = null;
    }
  },2000);
}
