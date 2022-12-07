import generatorUtils from '~utils/generatorUtils';

const context: Worker = self as any;

context.onmessage = (e: any) => {
	if (e.data.action === 'PAUSE') {
		generatorUtils.pause();
		return;
	} else if (e.data.action === 'ABORT') {
		generatorUtils.pause();
		return;
	} else if (e.data.action === 'CONTINUE') {
		generatorUtils.continue();
		return;
	} else if (e.data.action === 'CHANGE_SPEED') {
		generatorUtils.setSpeed(e.data.speed);
		return;
	}

	const { batchSize, numResults, speed, workerResources } = e.data;
	generatorUtils.setSpeed(speed);

	generatorUtils.generate(e.data, numResults, batchSize, {
		onBatchComplete: context.postMessage,
		dataTypeInterface: getWorkerInterface(workerResources.dataTypes),
		countryData: workerResources.countryData,
		workerUtils: workerResources.workerUtils
	});
};

// this standardizes the interface for communication between the workers, allowing generatorUtils to work for both
// workers + backend code
interface GetWorkerInterface {
	(dataTypeWorkerMap: object): {
		send: any;
		onSuccess: any;
		onError: any;
	}[];
}


// this standardizes the interface for communication between the workers, allowing generatorUtils to work for both
// workers + backend code
const getWorkerInterface: GetWorkerInterface = (dataTypeWorkerMap) => {
	const dataTypeInterface: any = {};
	Object.keys(dataTypeWorkerMap).map((dataType) => {

		// @ts-ignore
		const worker = new Worker(dataTypeWorkerMap[dataType]);

		// TODO check performance on this
		let onSuccess: any;
		const onRegisterSuccess = (f: any) => onSuccess = f;
		worker.onmessage = (resp) => {
			if (onSuccess) {
				onSuccess(resp);
			}
		};
		let onError: any;
		const onRegisterError = (f: any) => onError = f;
		worker.onerror = (resp) => {
			if (onError) {
				onError(resp);
			}
		};

		const dtInterface = {
			send: worker.postMessage,
			onSuccess: onRegisterSuccess,
			onError: onRegisterError,
		};

		dtInterface.send = dtInterface.send.bind(worker);

		dataTypeInterface[dataType] = dtInterface;
	});

	return dataTypeInterface;
}

export {};
