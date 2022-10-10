import ElectronSVG from './electronjs-icon.svg';
import './App.css';
import { Version } from 'optifine-utils';

import React, { Component } from 'react';
import Select from '@mui/material/Select';
import {
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LoadingOverlay from 'react-loading-overlay';
import { webContents } from 'electron';

const selectStyle = (theme: any) => ({
    select: {
        '&:before': {
            borderColor: '#ffffff',
        },
        '&:after': {
            borderColor: '#ffffff',
        },
    },
    icon: {
        fill: '#ffffff',
    },
});

export class App extends Component<
    {},
    {
        versions: Version[];
        matchedVersions: Version[];
        minecraftVersions: any;
        selectedVersion: string;
        selectedMinecraftVersion: string;
        installing: boolean;
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            versions: [],
            matchedVersions: [],
            minecraftVersions: {},
            selectedVersion: '',
            selectedMinecraftVersion: '',
            installing: false,
        };
    }

    async componentDidMount() {
        const versions = await window.Main.getVersions();
        const mcVers: string[] = [];
        for (const version of versions) {
            if (!mcVers.includes(version.minecraftVersion)) {
                mcVers.push(version.minecraftVersion);
            }
        }

        const minecraftVersions: any = {};
        for (const version of mcVers) {
            const majorVersion =
                version.split('.')[0] + '.' + version.split('.')[1];
            if (!minecraftVersions[majorVersion]) {
                minecraftVersions[majorVersion] = [];
            }
            minecraftVersions[majorVersion].push(version);
        }

        const matchedVersions = matchVersions(
            versions,
            versions[0].minecraftVersion
        );

        this.setState({
            versions,
            minecraftVersions,
            matchedVersions,
            selectedVersion: matchedVersions[0].fileName,
            selectedMinecraftVersion: matchedVersions[0].minecraftVersion,
        });

        window.Main.on('installing', (installing: boolean) => {
            this.setState({ installing });
        });
    }

    render() {
        return (
            <LoadingOverlay
                spinner
                active={this.state.installing}>
                <div className='App'>
                    <h2>Install OptiFine</h2>
                    <div>
                        <FormControl sx={{ m: 1, minWidth: 180 }}>
                            <InputLabel
                                htmlFor='grouped-native-select'
                                sx={{
                                    color: '#ffffff',
                                    '&:focus': {
                                        color: '#ffffff',
                                    },
                                }}>
                                Minecraft Version
                            </InputLabel>
                            <Select
                                native
                                defaultValue={
                                    this.state.selectedMinecraftVersion
                                }
                                size='small'
                                id='grouped-native-select'
                                value={this.state.selectedMinecraftVersion}
                                onChange={(e) => {
                                    const matchedVersions = matchVersions(
                                        this.state.versions,
                                        e.target.value
                                    );
                                    this.setState({
                                        matchedVersions,
                                        selectedVersion:
                                            matchedVersions[0].fileName,
                                        selectedMinecraftVersion:
                                            e.target.value,
                                    });
                                }}
                                sx={{
                                    color: 'white',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor:
                                            'rgba(228, 219, 233, 0.25)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor:
                                                'rgba(228, 219, 233, 0.25)',
                                        },
                                    '&:hover .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor:
                                                'rgba(228, 219, 233, 0.25)',
                                        },
                                    '.MuiSvgIcon-root ': {
                                        fill: 'white !important',
                                    },
                                }}
                                label='Minecraft Version'>
                                {Object.keys(this.state.minecraftVersions).map(
                                    (majorVersion) => (
                                        <optgroup
                                            label={majorVersion}
                                            key={majorVersion}>
                                            {this.state.minecraftVersions[
                                                majorVersion
                                            ].map((version: any) => (
                                                <option value={version}>
                                                    {version}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ m: 1, minWidth: 380 }}>
                            <InputLabel
                                htmlFor='native-select'
                                sx={{
                                    color: '#ffffff',
                                    '&:focus': {
                                        color: '#ffffff',
                                    },
                                }}>
                                Optifine Version
                            </InputLabel>
                            <Select
                                native
                                defaultValue={this.state.selectedVersion}
                                size='small'
                                id='native-select'
                                value={this.state.selectedVersion}
                                onChange={(e) => {
                                    this.setState({
                                        selectedVersion: e.target.value,
                                    });
                                }}
                                sx={{
                                    color: 'white',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor:
                                            'rgba(228, 219, 233, 0.25)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor:
                                                'rgba(228, 219, 233, 0.25)',
                                        },
                                    '&:hover .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor:
                                                'rgba(228, 219, 233, 0.25)',
                                        },
                                    '.MuiSvgIcon-root ': {
                                        fill: 'white !important',
                                    },
                                }}
                                label='Minecraft Version'>
                                {this.state.matchedVersions.map((version) => (
                                    <option value={version.fileName}>
                                        {version.fileName}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div className='button-container'>
                        <Button
                            variant='contained'
                            endIcon={<FileDownloadIcon />}
                            onClick={async () => {
                                const version = this.state.versions.find(
                                    (v) =>
                                        v.fileName ===
                                        this.state.selectedVersion
                                );
                                if (version) {
                                    console.log(
                                        'install from renderer',
                                        version
                                    );
                                    window.Main.install(version);
                                }
                            }}
                            color='success'>
                            Install
                        </Button>
                    </div>
                </div>
            </LoadingOverlay>
        );
    }
}

export default App;

const matchVersions = (
    versions: Version[],
    minecraftVersion: string
): Version[] => {
    const matchedVersions: Version[] = [];
    for (const version of versions) {
        if (version.minecraftVersion === minecraftVersion) {
            matchedVersions.push(version);
        }
    }
    return matchedVersions;
};
