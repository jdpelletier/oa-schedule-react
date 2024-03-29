import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table } from "./components/Table/Table";
import { UploadFile } from "./components/UploadFile/UploadFile"
import DateSelector from "./components/DateSelector/DateSelector"
import ErrorBoundry from "./components/ErrorBoundry"
import Today from './static/schedToday.PNG'
import Om from './static/schedOm.PNG'
import Pay from './static/schedPay.PNG'
import Hol from './static/schedHol.PNG'
import { format } from "date-fns"
import "./App.css"

function App () {
  const [schedule, setSchedule] = useState([])
  const [columns, setColumns] = useState([])
  const [holidays, setHolidays] = useState([])
  const [observingMeetings, setObservingMeetings] = useState([])
  const [firstDay, setFirstDay] = useState(new Date().setDate(new Date().getDate()-14))
  const [legend, setLegend] = useState(false)
  // eslint-disable-next-line
  const [isAdmin, setIsAdmin] = useState(false)
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const dataFetchedRef = useRef(false);

  const api ="/api/oa-schedule";

  const filterRange = (range) => {
    if (new Date(range[0]).getTime() < firstDay && new Date(range[1]).getTime() < firstDay && range[1] !== null){
      fetch(`${api}/nightstaff`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({'Start': new Date(range[0]).getTime(), 'End': new Date(range[1]).getTime(), 'Overlap': false })
    })
      .then(response => response.json())
      .then(data => {
        const newsched = data.concat(schedule)
        fetch(`${api}/observers`, {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({'Schedule': newsched, 'Start': new Date(range[0]).getTime(), 'End': new Date(range[1]).getTime()})
            })
              .then(response => response.json())
              .then(data => {
                setSchedule([...data])
                setDateRange(range)
           });
      });
    }else if (new Date(range[0]).getTime() < firstDay && range[1] !== null){
      fetch(`${api}/nightstaff`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({'Start': new Date(range[0]).getTime(), 'End': firstDay, 'Overlap': true})
    })
      .then(response => response.json())
      .then(data => {
        const newsched = data.concat(schedule)
        fetch(`${api}/observers`, {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({'Schedule': newsched, 'Start': new Date(range[0]).getTime(), 'End': new Date(range[1]).getTime() })
            })
              .then(response => response.json())
              .then(data => {
                setSchedule([...data])
                setDateRange(range)
           });
      });
    }else if(startDate !== null && endDate !== null){
      getSchedule()
      setDateRange(range)
    }else{
      setDateRange(range)
    }   
  }

  const filteredSchedule = () => {
    if(startDate !== null && endDate !== null){
      return schedule.filter(sched => (sched.Date <= endDate && sched.Date >= startDate));
    }else{
      const d = new Date();
      d.setDate(d.getDate()-14);
      return schedule.filter(sched => (sched.Date >= d));
    }
  }

  const cols = (schedule) => {
    const COLUMNS = [];
    const first = schedule[0];
    const splits = ['K1 PI', 'K2 PI', 'K1 Institution', 'K2 Institution', 'K1 Instrument', 'K2 Instrument']

    for (var key in first) {
      if (key==='Date'){
        COLUMNS.push(
         {
           Header: key,
           Footer: key,
           accessor: key,
           Cell: ({ value }) => { return format(new Date(value), 'MM/dd/yyy')}
         }
        )
      }else if (splits.includes(key)){
        COLUMNS.push(
          {
            Header: key,
            Footer: key,
            accessor: key,
            Cell: ({ value }) => { return value.split('/').join(' / ')}
          }
         )
      }else if (key!=='Holiday' && key!=='Mtg'){
        COLUMNS.push(
         {
           Header: key,
           Footer: key,
           accessor: key
         }
        )
      }
    }
    return COLUMNS;
  }

  const convertTime = (d) => {
    return d.getTime()-(d.getTime()%86400000) - 50400000
  }

  const findHolidays = useCallback((data)=> {
    const hol = []
    for (var day in data){
      if(data[day].Holiday === 'X'){
        hol.push(data[day].Date)
      }
    }
    setHolidays([...hol])
  }, [])

  const findOMs = useCallback((data)=> {
    const om = []
    for (var day in data){
      if(data[day].Mtg === 'OM'){
        om.push(data[day].Date)
      }
    }
    setObservingMeetings([...om])
  }, [])

  const getInitialSchedule = useCallback(() => {
    let end = new Date().setDate(new Date().getDate()+60)
    fetch(`${api}/nightstaff`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({'Start': firstDay, 'End': end, 'Overlap': false })
          })
          .then(response => response.json())
          .then(data => {
            setSchedule([...data])
            setColumns([...cols(data)])
            fetch(`${api}/observers`, {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({'Schedule': data, 'Start': firstDay, 'End': end })
            })
              .then(response => response.json())
              .then(data => {
                setSchedule([...data])
                setColumns([...cols(data)])
              });
          });
    }, [firstDay])

  const getSchedule = useCallback(() => {
    fetch(`${api}/`)
    .then(response => response.json())
    .then(data => {
      setSchedule([...data])
      setColumns([...cols(data)])
      findHolidays(data)
      findOMs(data)
      setFirstDay(data[0].Date)
      fetch(`${api}/observers`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({'Schedule': data, 'Start': data[0].Date, 'End': data[data.length-1].Date })
      })
        .then(response => response.json())
        .then(data => {
          setSchedule([...data])
          setColumns([...cols(data)])
        });
    });
  }, [findHolidays, findOMs])

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetch('/staffinfo')
      .then(response => response.json())
      .then(data => {
        fetch(`${api}/is_admin`, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({'Username': data.Alias})
        })
        .then(response => response.json())
        .then(data => {
            setIsAdmin(data.Admin)
         })
        .then(
          fetch(`${api}/file_check`)
          .then(response => response.json())
          .then(data => {
            if (data.File){
              getSchedule()
            }else{
              getInitialSchedule()
            }
          })
        )
      });
         
  }, [getInitialSchedule, getSchedule])

  const onNewSchedule = (data) => {
    setSchedule([...data])
    setColumns([...cols(data)])
    findHolidays(data)
    findOMs(data)
  }

  if (schedule.length === 0) {
        return <div />
  }else{
    return (
      <div>
        <ErrorBoundry>
          <div className="grid-container">
            <div className="grid-item">
              <DateSelector dateRange={dateRange} filterRange={filterRange}/>
            </div>
            <div className="grid-item">
              <button
                  onMouseEnter={() => setLegend(true)}
                  onMouseLeave={() => setLegend(false)}>
                  Legend
                  {legend && (
                    <>
                      : <img src={Today} alt="today" style={{width:"10px", height:"10px"}} /> Today
                      / <img src={Om} alt="om" style={{width:"10px", height:"10px"}} /> Meeting
                      / <img src={Pay} alt="pay" style={{width:"10px", height:"10px"}} /> Pay Period
                      / <img src={Hol} alt="holiday" style={{width:"10px", height:"10px"}} /> Holiday
                    </>
                  )}
                </button>
            </div>
            <div className="grid-item">
              <UploadFile isAdmin={isAdmin} onNewSchedule={onNewSchedule} api={api}/>
            </div>
          </div>
          <Table dat={filteredSchedule()} cols={columns} holidays={holidays} oms={observingMeetings} basepay={new Date("2022-01-02")} today={convertTime(new Date())} api={api}
            getCellProps={cellInfo => ({
              style: {
                backgroundColor: ["K1", "K1O", "K1T", "R1", "R1O", "R1T"].includes(cellInfo.value) ? "#FFC863" :
                                 ["K2", "K2O", "K2T", "R2", "R2O", "R2T"].includes(cellInfo.value) ? "#7272FD" :
                                 ["K1!", "K1O!", "K1T!", "R1!", "R1O!", "R1T!", "K2!", "K2O!", "K2T!", "R2!", "R2O!", "R2T!"].includes(cellInfo.value) ? "#FF0000" :
                                 ["X", "L"].includes(cellInfo.value) ? "#E8B6EC" :
                                 cellInfo.value === "OM" ? "#FFFF64" :
                                 cellInfo.value === "HQ" ? "#9DC183" :
                                 null
  
              },
            })}/>
        </ErrorBoundry>
      </div>
    );
  }


  

}


export default App;
