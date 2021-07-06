import React, {useState} from 'react';
// import { Button } from "semantic-ui-react";

export const UploadFile = ({ onRouteChange, isSignedIn, onNewSchedule }) => {

  const [selectedFile, setSelectedFile] = useState();


	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	const handleSubmission = () => {
    console.log('submitting...')
  	const formData = new FormData();

  	formData.append('file', selectedFile);

  	fetch(
  		'http://localhost:5000/update_schedule',
  		{
  			method: 'POST',
        body: formData
  	  }
    ).then(response => response.json())
     .then(data => onNewSchedule(data));
  }

  if(isSignedIn) {
  	return(
      <div>
      	<input type="file" name="file" onChange={changeHandler} />
      	<div>
      		<button onClick={handleSubmission}>Submit</button>
      	</div>
        <p onClick={() => onRouteChange('signout')} className='tr f3 link dim black underline pa3 pointer'>Sign Out</p>
      </div>
  	)
  }else{
    return(
      <p onClick={() => onRouteChange('signin')} className=' tr f3 link dim black underline pa3 pointer'>Sign In</p>
    )
  }
}



//   return (
//     <Button
//       onClick={async () => {
//         const response = await fetch('/update_schedule', {
//           method: 'POST'
//         });
//         if (response.ok) {
//           console.log("response worked")
//       }
//     }}
//     >
//       submit
//     </Button>
//   )
// }
