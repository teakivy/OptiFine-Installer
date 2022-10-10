import ElectronSVG from "./electronjs-icon.svg";
import "./App.css";
import { Version } from "optifine-utils";

import React, { Component } from "react";
import Select from "@mui/material/Select";
import {
	Alert,
	AlertTitle,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	ListSubheader,
	MenuItem,
	Slide,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LoadingOverlay from "react-loading-overlay";
import { webContents } from "electron";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement<any, any>;
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export class App extends Component<
	{},
	{
		versions: Version[];
		matchedVersions: Version[];
		minecraftVersions: any;
		mcVersions: string[];
		selectedVersion: string;
		selectedMinecraftVersion: string;
		installing: boolean;
		showSuccessMessage: boolean;
		showFailureMessage: boolean;
	}
> {
	constructor(props: {}) {
		super(props);
		this.state = {
			versions: [],
			matchedVersions: [],
			mcVersions: [],
			minecraftVersions: {},
			selectedVersion: "",
			selectedMinecraftVersion: "",
			installing: false,
			showSuccessMessage: false,
			showFailureMessage: false,
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
				version.split(".")[0] + "." + version.split(".")[1];
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
			mcVersions: mcVers,
			matchedVersions,
			selectedVersion: matchedVersions[0].fileName,
			selectedMinecraftVersion: matchedVersions[0].minecraftVersion,
		});

		window.Main.on("installing", (installing: boolean) => {
			this.setState({ installing });
		});

		window.Main.on("install-success", () => {
			this.setState({ showSuccessMessage: true });
		});
	}

	render() {
		return (
			<LoadingOverlay spinner active={this.state.installing}>
				<div className="App">
					<Dialog
						open={this.state.showSuccessMessage}
						onClose={() => {
							this.setState({ showSuccessMessage: false });
						}}
						aria-labelledby="responsive-dialog-title"
						style={{
							color: "white",
						}}
						PaperProps={{
							style: {
								backgroundColor: "#2e2e2e",
								color: "#ffffff",
							},
						}}
						TransitionComponent={Transition}
					>
						<DialogContent>
							<DialogContentText color={"#ffffff"}>
								Installation Complete!
							</DialogContentText>
						</DialogContent>
					</Dialog>

					<h2>Optifine Installer</h2>
					<div>
						<FormControl sx={{ m: 1, minWidth: 180 }}>
							<InputLabel
								htmlFor="grouped-select"
								sx={{
									color: "#ffffff",
									"&:focus": {
										color: "#ffffff",
									},
								}}
							>
								Minecraft Version
							</InputLabel>
							<Select
								defaultValue={
									this.state.selectedMinecraftVersion
								}
								size="small"
								id="grouped-select"
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
									color: "white",
									".MuiOutlinedInput-notchedOutline": {
										borderColor:
											"rgba(228, 219, 233, 0.25)",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline":
										{
											borderColor:
												"rgba(228, 219, 233, 0.25)",
										},
									"&:hover .MuiOutlinedInput-notchedOutline":
										{
											borderColor:
												"rgba(228, 219, 233, 0.25)",
										},
									".MuiSvgIcon-root ": {
										fill: "white !important",
									},
								}}
								label="Minecraft Version"
							>
								{/* {Object.keys(this.state.minecraftVersions).map(
									(majorVersion) => (
										<span>
											<ListSubheader key={majorVersion}>
												{console.log(majorVersion)}
												{majorVersion}
											</ListSubheader>

											{this.state.minecraftVersions[
												majorVersion
											].map((version: any) => (
												<MenuItem value={version}>
													{version}
												</MenuItem>
											))}
										</span>
									)
								)} */}
								{this.state.mcVersions.map((version) => (
									<MenuItem value={version}>
										{version}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl sx={{ m: 1, minWidth: 380 }}>
							<InputLabel
								htmlFor="native-select"
								sx={{
									color: "#ffffff",
									"&:focus": {
										color: "#ffffff",
									},
								}}
							>
								Optifine Version
							</InputLabel>
							<Select
								defaultValue={this.state.selectedVersion}
								size="small"
								id="native-select"
								value={this.state.selectedVersion}
								onChange={(e) => {
									this.setState({
										selectedVersion: e.target.value,
									});
								}}
								sx={{
									color: "white",
									".MuiOutlinedInput-notchedOutline": {
										borderColor:
											"rgba(228, 219, 233, 0.25)",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline":
										{
											borderColor:
												"rgba(228, 219, 233, 0.25)",
										},
									"&:hover .MuiOutlinedInput-notchedOutline":
										{
											borderColor:
												"rgba(228, 219, 233, 0.25)",
										},
									".MuiSvgIcon-root ": {
										fill: "white !important",
									},
								}}
								label="Minecraft Version"
							>
								{this.state.matchedVersions.map((version) => (
									<MenuItem value={version.fileName}>
										{version.fileName}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>

					<div className="button-container">
						<Button
							variant="contained"
							endIcon={<FileDownloadIcon />}
							onClick={async () => {
								const version = this.state.versions.find(
									(v) =>
										v.fileName ===
										this.state.selectedVersion
								);
								if (version) {
									console.log(
										"install from renderer",
										version
									);
									window.Main.install(version);
								}
							}}
							color="success"
						>
							Install
						</Button>
					</div>

					<div className="footer">
						Not affiliated with Optifine or Mojang • Created by{" "}
						<span
							onClick={() => {
								console.log("clicked");
								window.Main.openURL(
									"https://twitter.com/TeakIvyYT"
								);
							}}
							className="footer-link"
						>
							@TeakIvyYT
						</span>
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
