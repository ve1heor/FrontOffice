const { app, BrowserWindow } = require('electron')
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//const fs = require('fs');
let mainWindow 

function createWindow () {
  mainWindow = new BrowserWindow({
  	//kiosk:true,
  	width: 900, 
  	height: 700, 
  	show: false
  }); //{width: 800, height: 650}

  mainWindow.loadFile('index.html')
  mainWindow.setMenu(null)
  mainWindow.webContents.openDevTools()

  mainWindow.once('ready-to-show', () => {
     mainWindow.show();
  })
  mainWindow.on('close', function (e) {
    //alert("PISOS");
    
  });
  mainWindow.on('closed', function (e) {
    mainWindow = null
    /*var curr_dir = __dirname.replace('\\resources\\app.asar','');
    fs.rename(curr_dir + "\\update.dat", curr_dir + "\\resources\\app.asar", function(response){
      console.log("Обновление завершено!");
    });*/
  });
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  };
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
