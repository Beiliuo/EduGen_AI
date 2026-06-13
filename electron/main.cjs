const { app, BrowserWindow, dialog, shell } = require("electron");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

let mainWindow;
let serverUrl;
let bootPromise;

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 3000;
      server.close(() => resolve(port));
    });
  });
}

function getNextServerPaths() {
  if (app.isPackaged) {
    const root = path.join(process.resourcesPath, "next");
    return {
      root,
      server: path.join(root, "server.js")
    };
  }

  const root = path.join(__dirname, "..", ".next", "standalone");
  return {
    root,
    server: path.join(root, "server.js")
  };
}

function waitForServer(url, timeoutMs = 45000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("本地服务启动超时，请确认应用构建产物完整。"));
          return;
        }
        setTimeout(check, 300);
      });
      request.setTimeout(1500, () => request.destroy());
    }

    check();
  });
}

async function startNextServer() {
  if (serverUrl) return serverUrl;

  const port = await getAvailablePort();
  const paths = getNextServerPaths();
  const url = `http://127.0.0.1:${port}`;

  process.env.NODE_ENV = "production";
  process.env.PORT = String(port);
  process.env.HOSTNAME = "127.0.0.1";

  require(paths.server);

  await waitForServer(url);
  serverUrl = url;
  return url;
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1080,
    minHeight: 720,
    title: "EduGen AI",
    backgroundColor: "#f8fafc",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  mainWindow.loadURL(url);
}

async function boot() {
  if (bootPromise) return bootPromise;

  bootPromise = startNextServer()
    .then((url) => {
      if (!mainWindow || mainWindow.isDestroyed()) {
        createWindow(url);
      }
    })
    .catch((error) => {
      dialog.showErrorBox("EduGen AI 启动失败", error instanceof Error ? error.message : "本地应用启动失败");
      app.quit();
    });

  return bootPromise;
}

app.whenReady().then(boot);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    boot();
  }
});
