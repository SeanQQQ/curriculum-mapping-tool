import React, { useEffect, useState } from 'react';
import './index.css';
import NodeGraph from './NodeGraph';
import InfoBox from './infoBox';


function Graph( {width} ) {
  const [data, setData] = useState(null);
  const [infoBoxVisible, setInfoBoxVisible] = useState(false);
  const [infoBoxData, setInfoBoxData] = useState(null);

  function setInfoBoxValues(data){
    setInfoBoxVisible( !(infoBoxData===data && infoBoxVisible) );
    setInfoBoxData(data);
  }

  useEffect(() => {
    fetch('https://curriculummappingapi.azurewebsites.net/Subject')
      .then((res) => res.json())
      .then((d) => {
        setData({ nodes: d.subjects, links: d.links });
      });
    
  }, []);

  if(data){
    return (
      <div className="App">
          <NodeGraph data={data} width={width/2} height={width/2} infoBoxCallback={setInfoBoxValues}/>
          <InfoBox isVisible={infoBoxVisible} data={infoBoxData} width={width/2 - 100} height={width/2}/>
      </div>
    );
  }else{
    return <div></div>
  }

}

export default Graph;