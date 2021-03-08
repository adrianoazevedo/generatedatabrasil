import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Button from '@material-ui/core/Button';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Pagination from '~components/Pagination';
import * as queries from '~core/queries';
import DeleteDataSetDialog from '~core/dialogs/deleteDataSet/DeleteDataSetDialog.component';
import styles from './DataSets.scss';
import { DataSetListItem } from '~types/dataSets';
import { formatUnixTime } from '~utils/dateUtils';
import { getGeneratorRoute } from '~utils/routeUtils';
import { useHistory } from 'react-router';

const Row = ({ onDelete, onLoad, dataSet, i18n }: any): JSX.Element => (
	<div className={styles.row}>
		<div className={styles.dataSetName}>{dataSet.dataSetName}</div>
		<div className={styles.dateCreated}>{formatUnixTime(dataSet.historyDateCreatedUnix)}</div>
		<div className={styles.numRowsGenerated}>{dataSet.numRowsGenerated}</div>
		<div className={styles.status}>
			{dataSet.status === 'public' ? i18n.public : i18n.private}
		</div>
		<div className={styles.open}>
			<Button size="small" type="submit" color="secondary" variant="outlined" onClick={onLoad}>{i18n.open}</Button>
		</div>
		<div className={styles.history}>
			<Button size="small" type="submit" color="primary" variant="outlined">{i18n.history}</Button>
		</div>
		<div className={styles.del} onClick={onDelete}>
			<HighlightOffIcon />
		</div>
	</div>
);

export type DataSetsProps = {
	onLoadDataSet: (dataSet: DataSetListItem) => void;
	className: string;
	i18n: any;
};

// to be moved to a user setting at some point
const NUM_PER_PAGE = 10;

const DataSets = ({ onLoadDataSet, i18n, className = '' }: DataSetsProps): JSX.Element | null => {
	const history = useHistory();
	const [selectedDataSet, selectDataSet] = useState<DataSetListItem>();
	const [currentPage, setCurrentPage] = useState(1);
	const [dialogVisible, setDeleteDialogVisibility] = useState(false);

	const { data } = useQuery(queries.GET_DATA_SETS, {
		fetchPolicy: 'no-cache',
		variables: {
			offset: (currentPage - 1) * NUM_PER_PAGE,
			limit: NUM_PER_PAGE
		}
	});

	const loadDataSet = (dataSet: DataSetListItem): void => {
		onLoadDataSet(dataSet);
		history.push(getGeneratorRoute());
	};

	const [deleteDataSet] = useMutation(queries.DELETE_DATA_SET, {
		refetchQueries: [
			{ query: queries.GET_DATA_SETS }
		],
		onCompleted: () => {
			setDeleteDialogVisibility(false);
		}
	});

	// show spinner here
	if (!data || !data.dataSets) {
		return null;
	}

	const onShowDeleteDialog = (dataSet: DataSetListItem): void => {
		selectDataSet(dataSet);
		setDeleteDialogVisibility(true);
	};

	const { results, totalCount } = data.dataSets;

	return (
		<>
			<section className={`${className} ${styles.page}`}>
				<h2><span>{totalCount}</span> {i18n.dataSets}</h2>

				<div className={styles.table}>
					<div className={`${styles.row} ${styles.header}`}>
						<div className={styles.dataSetName}>{i18n.dataSetName}</div>
						<div className={styles.lastModified}>{i18n.lastModified}</div>
						<div className={styles.numRowsGenerated}>{i18n.rowsGenerated}</div>
						<div className={styles.status}>{i18n.status}</div>
						<div className={styles.open}>{i18n.open}</div>
						<div className={styles.history}>{i18n.history}</div>
						<div className={styles.del} />
					</div>
					<div className={styles.body}>
						{results.map((dataSet: DataSetListItem) => (
							<Row
								key={dataSet.dataSetId}
								dataSet={dataSet}
								onDelete={(): void => onShowDeleteDialog(dataSet)}
								onLoad={(): void => loadDataSet(dataSet)}
								i18n={i18n}
							/>
						))}
					</div>
				</div>
				<div className={styles.paginationRow}>
					<Pagination
						numPages={Math.ceil(totalCount / NUM_PER_PAGE)}
						currentPage={currentPage}
						onChange={(e: any, pageNum: number): void => setCurrentPage(pageNum)}
					/>
				</div>
			</section>

			<DeleteDataSetDialog
				visible={dialogVisible}
				dataSetName={selectedDataSet ? selectedDataSet.dataSetName : null}
				onClose={(): void => setDeleteDialogVisibility(false)}
				onDelete={(): any => deleteDataSet({
					variables: {
						dataSetId: selectedDataSet!.dataSetId
					}
				})}
				i18n={i18n}
			/>
		</>
	);
};

export default DataSets;
