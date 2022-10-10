import { contextBridge, ipcRenderer } from 'electron';
import { getVersions, GetVersionsFiler, Version } from 'optifine-utils';

export const api = {
    /**
     * Here you can expose functions to the renderer process
     * so they can interact with the main (electron) side
     * without security problems.
     *
     * The function below can accessed using `window.Main.sendMessage`
     */

    sendMessage: (message: string) => {
        ipcRenderer.send('message', message);
    },

    /**
     * Provide an easier way to listen to events
     */
    on: (channel: string, callback: Function) => {
        ipcRenderer.on(channel, (_, data) => callback(data));
    },

    getVersions: async (filter?: GetVersionsFiler): Promise<Version[]> => {
        return await getVersions(filter);
    },

    install: (version: Version) => {
        console.log('install from bridge', version);
        ipcRenderer.send('install', JSON.stringify(version));
    },

    runInstaller: async (version: Version): Promise<boolean> => {
        return await version.runInstaller();
    },
};

contextBridge.exposeInMainWorld('Main', api);
