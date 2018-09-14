const {Menu, BrowserWindow} = require('electron');
const electron = require('electron');
const app = electron.app;
const {ipcMain} = require('electron');

  let mainWindow;
  let splashWindow;
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'exportieren nach Excel...',
          click () {
            mainWindow.webContents.send('export-excel');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'über Auxfina...',
          click () {
            let about = new BrowserWindow({
              width: 640,
              height: 226,
              transparent: true,
              frame: false,
              alwaysOnTop: true,
              resizable: false
            });
            about.loadURL(`file://${__dirname}/splash.html`);
          }
        }
      ]
    }
  ];

  exports.installMainMenu = function(win) {
    mainWindow = win;
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  };

