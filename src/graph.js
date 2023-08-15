import React, { useEffect, useState } from 'react';
import './index.css';
import NodeGraph from './NodeGraph';


function Graph( {width} ) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://localhost:7099/Subject')
      .then((res) => res.json())
      .then((d) => {
        setData({ nodes: d.subjects, links: d.links });
      });
    
  }, []);

  if(data){
    return (
      <div className="App">
          <NodeGraph data={data} width={width-width/4} height={width}/>
      </div>
    );
  }else{
    return <div></div>
  }

}

export default Graph;