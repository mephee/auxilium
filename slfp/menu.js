const {Menu, BrowserWindow} = require('electron');
const electron = require('electron');
const app = electron.app;
const {ipcMain, dialog} = require('electron');

  let mainWindow;
  let splashWindow;
  const developer = {
    label: 'Ansicht',
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
      }
    ]
  };

  const template = [
    {
      label: 'Datei',
      submenu: [
        // {
        //   label: 'Kopie speichern',
        //   click () {
        //     let filename = dialog.showSaveDialog({
        //       title:'Kopie speichern unter',
        //       defaultPath: 'Kopie.aux',
        //       filters: [
        //         {name: 'Auxfina', extensions: ['aux']}
        //       ]});
        //     if (filename) {
        //       mainWindow.webContents.send('export-aux', filename);
        //     }
        //   }
        // },
        {
          label: 'Exportieren in Excel-Datei',
          click () {
            let filename = dialog.showSaveDialog({
              title:'Exportieren in Excel-Datei',
              defaultPath: 'Export.xlsx',
              filters: [
                {name: 'Excel', extensions: ['xlsx']}
              ]});
            if (filename) {
              mainWindow.webContents.send('export-excel', filename);
            }
          }
        }
      ]
    },
    {
      label: 'Einstellungen',
      submenu: [
        // {
        //   label: 'Kopie speichern',
        //   click () {
        //     let filename = dialog.showSaveDialog({
        //       title:'Kopie speichern unter',
        //       defaultPath: 'Kopie.aux',
        //       filters: [
        //         {name: 'Auxfina', extensions: ['aux']}
        //       ]});
        //     if (filename) {
        //       mainWindow.webContents.send('export-aux', filename);
        //     }
        //   }
        // },
        {
          label: 'Indextabelle',
          click () {
            mainWindow.webContents.send('indextable');
            console.log('send open index');
          }
        },
        {
          label: 'Spezialfinanzierungen',
          click () {
            mainWindow.webContents.send('customspecial');
          }
        }
      ]
    },
    {
      label: 'Hilfe',
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
        },
        {
          type: 'separator'
        },
        {
          label: 'Developer...',
          type: 'submenu',
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
            }
          ]
        }
      ]
    }
  ];

  exports.installMainMenu = function(win) {
    mainWindow = win;
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  };

