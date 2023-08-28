import React, { useEffect, useState } from 'react';
import './index.css';
import NodeGraph from './NodeGraph';
import InfoBox from './infoBox';


function Graph( {width, courseId} ) {
  const [data, setData] = useState(null);
  const [infoBoxVisible, setInfoBoxVisible] = useState(false);
  const [infoBoxData, setInfoBoxData] = useState(null);
  
  function setInfoBoxValues(data){
    setInfoBoxVisible( !(infoBoxData===data && infoBoxVisible) );
    setInfoBoxData(data);
  }

  useEffect(() => {
    fetch('https://curriculummappingapi.azurewebsites.net/Subject?CourseId=' + courseId)
      .then((res) => res.json())
      .then((d) => {
        setData({ nodes: d.subjects, links: d.links });
      });
    
  }, [courseId]);

  if(data){
    return (
      <div className="App">
          <NodeGraph data={data} width={width/2} height={width} infoBoxCallback={setInfoBoxValues}/>
          <InfoBox isVisible={infoBoxVisible} data={infoBoxData} width={width/2 - width/48} height={width}/>
      </div>
    );
  }else{
    return <div></div>
  }

}

export default Graph;