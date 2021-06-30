import React, { useMemo }  from 'react'
import { useTable, useFilters } from 'react-table'
import { Checkbox } from './CheckBox'
import './Table.css'
import { ColumnFilter } from './ColumnFilter'

export const Table = ({dat, cols, getCellProps}) => {

  const columns = useMemo(() => cols, [cols])
  const data = useMemo(() => dat, [dat])

  const defaultColumn = useMemo(() => {
    return {
      Filter: ColumnFilter
    }
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
    getToggleHideAllColumnsProps,
  }  = useTable({
    columns,
    data,
    defaultColumn
  },
  useFilters)

  return (
    <>
      <div>
        <div>
          <Checkbox {...getToggleHideAllColumnsProps()}/> Toggle All
        </div>
      </div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map( (column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}<input type='checkbox' {...column.getToggleHiddenProps()} />
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row=> {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps([getCellProps(cell)])}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
            })}
        </tbody>
        <tfoot>
          {footerGroups.map((footerGroup) => (
              <tr {...footerGroup.getFooterGroupProps()}>
                {footerGroup.headers.map(column => (
                    <td {...column.getFooterProps}>{column.render('Footer')}</td>
                  ))}
              </tr>
            ))}
        </tfoot>
      </table>
  </>
  )
}
