import React from 'react';
import './index.css';
import NodeGraph from './NodeGraph';


function Graph() {

  let data = {
     nodes : [
      {id : 1, name : 'Programming Basics'},
      {id : 2, name : 'Software Production'},
      {id : 3, name : 'Design Fundamentals'},
      {id : 4, name : 'Database Design'},
      {id : 5, name : 'Frontend Design'},
      {id : 6, name : 'Backend Programming'},
      {id : 7, name : 'Software Testing'},
      {id : 8, name : 'Programming'},
      {id : 9, name : 'Advanced Programming'},
      {id : 10, name : 'Networking'},
    ],
    links : [
      {source: 1, target: 5},
      {source: 4, target: 6},
      {source: 8, target: 10},
      {source: 5, target: 6},
      {source: 6, target: 10},
    ] 
    };

  return (
    <div className="App">
        <NodeGraph data={data}/>
    </div>
  );
}

export default Graph;