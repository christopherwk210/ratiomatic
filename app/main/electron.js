// Imports
const { app, BrowserWindow, Tray, Menu } = require('electron');
const Positioner = require('electron-positioner');
const path = require('path');

// Resolve static assets
const htmlPath = path.join(__dirname, '../renderer/index.html');
const iconPath = path.join(__dirname, '../shared/images/ratiomatic-Template.png');

// Determine environment
process.env.NODE_ENV = process.env.NODE_ENV === 'development' ? process.env.NODE_ENV : 'production';
const development = process.env.NODE_ENV !== 'production';

app.on('ready', () => {
  // Prevent default Mac application behaviors and keyboard shortcuts
  app.dock.hide();
  Menu.setApplicationMenu(Menu.buildFromTemplate([]));

  const browserWindow = createBrowserWindow();

  if (development) {
    browserWindow.webContents.openDevTools();
  } else {
    browserWindow.on('blur', () => browserWindow.hide());
  }

  browserWindow.loadFile(htmlPath);

  const positioner = new Positioner(browserWindow);
  const tray = new Tray(iconPath);

  tray.on('click', () => {
    if (browserWindow.isVisible()) {
      browserWindow.hide();
    } else {
      browserWindow.show();
      positioner.move('trayCenter', tray.getBounds());
    }
  });
});

/**
 * Create the main application window with static configuration
 */
function createBrowserWindow() {
  const browserWindow = new BrowserWindow({
    width: 450,
    height: 150,
    frame: false,
    show: false,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    acceptFirstMouse: true,
    alwaysOnTop: true,
    fullscreen: false,
    movable: false
  });

  browserWindow.setMenu(null);
  browserWindow.setVisibleOnAllWorkspaces(true);

  return browserWindow;
}
