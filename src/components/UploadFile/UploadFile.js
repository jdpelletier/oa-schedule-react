import React, {useState} from 'react';

export const UploadFile = ({ isAdmin, onNewSchedule, api }) => {

  const [selectedFile, setSelectedFile] = useState();
  const [isWaiting, setIsWaiting] = useState(false);


	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	const handleSubmission = () => {
    console.log('submitting...')
  	const formData = new FormData();

  	formData.append('file', selectedFile);

    fetch('/staffinfo')
      .then(response => response.json())
      .then(data => {
        formData.append('user', JSON.stringify({'Username': data.Alias}));
        fetch(
          `${api}/update_schedule`,
          {
            method: 'POST',
            body: formData
          }
        ).then(response => response.json())
        .then(data => onNewSchedule(data));
      })
  }

  const handleCompare = () => {
    console.log('comparing...')
    setIsWaiting(true)
  	fetch(
  		`${api}/compare`
    ).then(response => response.json())
     .then(data => {
      onNewSchedule(data)
      setIsWaiting(false)});
  }

  if(isAdmin) {
  	return(
      <div className='tr'>
        <button disabled={isWaiting} onClick={handleCompare}>Compare with Telescope Schedule</button>
      	<input type="file" name="file" onChange={changeHandler} />
      	<button onClick={handleSubmission}>Submit</button>
      </div>
  	)
  }else{
    return(
      <div className='tr'>
      </div>
    )
  }
}

