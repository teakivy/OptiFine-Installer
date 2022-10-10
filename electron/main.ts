import { app, BrowserWindow, ipcMain } from "electron";
import { Version, installVersion } from "optifine-utils";

let mainWindow: BrowserWindow | null;

if (require("electron-squirrel-startup")) app.quit();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

function createWindow() {
	mainWindow = new BrowserWindow({
		// icon: path.join(assetsPath, 'assets', 'icon.png'),
		width: 650,
		height: 300,
		resizable: false,
		backgroundColor: "#282c34",
		title: "OptiFine Installer",
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			webSecurity: false,
		},
	});

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

async function registerListeners() {
	/**
	 * This comes from bridge integration, check bridge.ts
	 */
	ipcMain.on("message", (_, message) => {
		console.log(message);
	});

	ipcMain.on("install", async (_, version: string) => {
		mainWindow?.webContents.send("installing", true);

		let v = JSON.parse(version) as Version;
		await installVersion(v)
			.then((success: boolean) => {
				mainWindow?.webContents.send("installing", false);
				if (success) {
					mainWindow?.webContents.send("install-success");
				} else {
					mainWindow?.webContents.send("install-failed");
				}
			})
			.catch((err) => {
				mainWindow?.webContents.send("installing", false);
			});
	});

	ipcMain.on("open-url", (_, url: string) => {
		require("electron").shell.openExternal(url);
	});
}

app.on("ready", createWindow)
	.whenReady()
	.then(registerListeners)
	.catch((e) => console.error(e));

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
