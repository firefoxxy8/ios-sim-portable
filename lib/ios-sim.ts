import * as _ from "lodash";

function getSimulator(): ISimulator {
	let libraryPath = require("./iphone-simulator");
	let obj = new libraryPath.iPhoneSimulator();
	return obj.createSimulator();
}

const publicApi = {};

Object.defineProperty(publicApi, "getRunningSimulator", {
	get: () => {
		return (...args: any[]) => {
			let isResolved = false;

			return new Promise<any>((resolve, reject) => {
				let libraryPath = require("./iphone-simulator-xcode-simctl");
				let simulator = new libraryPath.XCodeSimctlSimulator();

				const tryGetBootedDevice = () => {
					try {
						return simulator.getBootedDevice.apply(simulator, args);
					} catch (err) {
						if (!isResolved) {
							isResolved  = true;
							reject(err);
						}
					}
				}

				let result = tryGetBootedDevice();

				if (!isResolved && !result) {
					let repeatCount = 30;
					let timer = setInterval(() => {
						result = tryGetBootedDevice();
						if ((result || !repeatCount) && !isResolved) {
							isResolved = true;
							clearInterval(timer);
							resolve(result);
						}
						repeatCount--;
					}, 500);
				}
			});
		}
	}
});

Object.defineProperty(publicApi, "getRunningSimulators", {
	get: () => {
		return (...args: any[]) => {
			let isResolved = false;

			return new Promise<any>(async (resolve, reject) => {
				const libraryPath = require("./iphone-simulator-xcode-simctl");
				const simulator = new libraryPath.XCodeSimctlSimulator();
				
				const tryGetBootedDevices = async () => {
					try {
						return await simulator.getBootedDevices.apply(simulator, args);
					} catch (err) {
						if (!isResolved) {
							isResolved = true;
							reject(err);
						}
					}
				}

				let result = await tryGetBootedDevices();
				if (result && result.length) {
					isResolved = true;
					resolve(result);
					return;
				}

				if (!isResolved && (!result || !result.length)) {
					const timer = setTimeout(async () => {
						result = await tryGetBootedDevices();
						if (!isResolved) {
							isResolved = true;
							resolve(result);
						}
					}, 500);
				}
			});
		}
	}
});

Object.defineProperty(publicApi, "getApplicationPath", {
	get: () => {
		return (...args: any[]) => {
			let simulator = getSimulator();
			let result = simulator.getApplicationPath.apply(simulator, args);
			return result;
		}
	}
});

Object.defineProperty(publicApi, "getInstalledApplications", {
	get: () => {
		return (...args: any[]) => {
			let simulator = getSimulator();
			let installedApplications: IApplication[] = simulator.getInstalledApplications.apply(simulator, args);
			let result = _.map(installedApplications, application => application.appIdentifier);
			return result;
		}
	}
});

Object.defineProperty(publicApi, "launchApplication", {
	get: () => {
		return (...args: any[]) => {
			const libraryPath = require("./iphone-simulator");
			const obj = new libraryPath.iPhoneSimulator();
			return obj.run.apply(obj, args);
		}
	}
});

Object.defineProperty(publicApi, "printDeviceTypes", {
	get: () => {
		return (...args: any[]) => {
			const libraryPath = require("./iphone-simulator");
			const obj = new libraryPath.iPhoneSimulator();
			return obj.printDeviceTypes.apply(obj, args);
		}
	}
});

["installApplication",
	"uninstallApplication",
	"startApplication",
	"stopApplication",
	"run",
	"getDeviceLogProcess",
	"startSimulator",
	"getSimulatorName",
	"getDevices",
	"sendNotification"].forEach(methodName => {
		Object.defineProperty(publicApi, methodName, {
			get: () => {
				return (...args: any[]) => {
					let simulator: any = getSimulator();
					return simulator[methodName].apply(simulator, args);
				}
			}
		});
	})

module.exports = publicApi;
