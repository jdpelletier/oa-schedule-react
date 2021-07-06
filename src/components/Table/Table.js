import React, { useMemo }  from 'react'
import { useTable, useFilters} from 'react-table'
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

  const telSchedule = (date) => {
    const day = new Date(date)
    const month = day.getMonth() + 1
    const linkDate = day.getFullYear() + '-' + month + '-' + day.getDate()
    window.open(window.location='https://www2.keck.hawaii.edu/observing/keckSchedule/keckSchedule.php?cmd=getSchedule&date=' + linkDate)
  }

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
    defaultColumn,
    telSchedule
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
                <th {...column.getHeaderProps()}><div className="checkmark"><input type='checkbox' {...column.getToggleHiddenProps()} /></div><br></br>{column.render('Header')}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row=> {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} onClick={() =>  telSchedule(row.original.Date)}>
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
