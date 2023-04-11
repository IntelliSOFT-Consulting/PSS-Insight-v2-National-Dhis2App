import React, { useState } from 'react';
import {
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  Pagination,
  CircularLoader,
  CenteredContent,
} from '@dhis2/ui';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  tableHeader: props => ({
    fontWeight: 'bold !important',
    backgroundColor: props.activeIndicator
      ? '#D9E8F5 !important'
      : props.isOld
      ? '#EBEBEB !important'
      : '',
    '& span': {
      width: '100%',
    },
  }),
  hidden: {
    display: 'none !important',
  },
});

const Table = ({
  columns,
  tableData = [],
  pageSize,
  pagination,
  emptyMessage,
  loading,
  ...props
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize || 15);

  const classes = useStyles(props);

  const handleChangePage = selected => {
    setPage(selected);
  };

  const handleChangeRowsPerPage = ({ selected }) => {
    setRowsPerPage(selected + 1);
  };

  const pageCount = Math.ceil(tableData.length / rowsPerPage);

  const getTableData = () => {
    if (loading) {
      return (
        <DataTableRow>
          <DataTableCell colSpan={columns.length}>
            <CenteredContent>
              <CircularLoader />
            </CenteredContent>
          </DataTableCell>
        </DataTableRow>
      );
    }

    if (tableData.length === 0) {
      return (
        <DataTableCell colSpan={columns.length} className='center'>
          {emptyMessage || 'No data available'}
        </DataTableCell>
      );
    }

    const visibleTableData = tableData.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );

    // Remove cells that are spanned by rowspan or colspan
    const spannedCells = new Set();
    for (let rowIndex = 0; rowIndex < visibleTableData.length; rowIndex++) {
      const row = visibleTableData[rowIndex];
      for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
        const column = columns[columnIndex];
        const cellValue = row[column.key];
        if (!spannedCells.has(`${rowIndex},${columnIndex}`)) {
          if (column.rowSpan && rowIndex < visibleTableData.length - 1) {
            for (let i = 1; i < column.rowSpan; i++) {
              spannedCells.add(`${rowIndex + i},${columnIndex}`);
            }
          }
          if (column.colSpan && columnIndex < columns.length - 1) {
            for (let i = 1; i < column.colSpan; i++) {
              spannedCells.add(`${rowIndex},${columnIndex + i}`);
            }
          }
        } else {
          row[column.key] = null;
        }
      }
    }

    return visibleTableData.map((row, rowIndex) => (
      <DataTableRow key={rowIndex}>
        {columns.map((column, columnIndex) => {
          if (row[column.key] === null) {
            if (column.colSpan || column.rowSpan) {
              return null;
            }
          }
          return (
            <DataTableCell
              key={`${rowIndex}-${columnIndex}`}
              width={column.width || 'auto'}
              rowSpan={column.rowSpan || 'auto'}
              colSpan={column.colSpan || 'auto'}
              bordered={props.bordered}
            >
              {column.render ? column.render(row, rowIndex) : row[column.key]}
            </DataTableCell>
          );
        })}
      </DataTableRow>
    ));
  };

  return (
    <>
      <DataTable>
        <TableHead>
          <DataTableRow>
            {columns.map((column, index) => (
              <DataTableColumnHeader
                key={index}
                className={`${classes.tableHeader} ${column.hidden ? classes.hidden : ''}`}
                width={column.width || 'auto'}
                colSpan={column.headerSpan || 'auto'}
                hidden={!column.name}
                style={{
                  display: !column.name ? 'none !important' : 'table-cell',
                }}
              >
                {column.name}
              </DataTableColumnHeader>
            ))}
          </DataTableRow>
        </TableHead>
        <TableBody>{getTableData()}</TableBody>
      </DataTable>
      {pagination && (
        <Pagination
          page={page}
          pageSize={rowsPerPage}
          pageCount={pageCount}
          onPageChange={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          total={tableData.length}
          {...props}
        />
      )}
    </>
  );
};

export default Table;
