import React, { useEffect, useState } from 'react';
import './index.css';
import NodeGraph from './NodeGraph';
import InfoBox from './infoBox';


function Graph( {width} ) {
  const [data, setData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [courseNote, setCourseNote] = useState(null);
  const [infoBoxVisible, setInfoBoxVisible] = useState(false);
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [courseId, setCourseId] = useState(null)

  function setInfoBoxValues(data){
    setInfoBoxVisible( !(infoBoxData===data && infoBoxVisible) );
    setInfoBoxData(data);
  }

  function handleSelect(e){
    let value  = e.target.value;
    setCourseId(value);
    setCourseNote(courseData.find(c => c.courseId === value).note)
  }

  useEffect(() => {
    fetch('https://curriculummappingapi.azurewebsites.net/Subject?CourseId=' + courseId)
      .then((res) => res.json())
      .then((d) => {
        setData({ nodes: d.subjects, links: d.links });
      });
  }, [courseId]);

  useEffect(() => {
    fetch('https://curriculummappingapi.azurewebsites.net/Course')
      .then((res) => res.json())
      .then((d) => {
        setCourseData(d.courses);
        setCourseId(d.courses[0].courseId)
        setCourseNote(d.courses[0].note)

      });
  }, []);

  if(data && courseData){
    return (
      <div className="App">
        <div style={{backgroundColor:"lightblue"}}>
          <select onChange={handleSelect}>
          {courseData.map((course, i) => (
            <option key={i} value={course.courseId}>{course.courseName}</option>
          ) )}
        </select> 
        <p style={{margin:"0px"}} >{ courseNote }</p>
        </div>
          <NodeGraph data={data} width={width/2} height={width} infoBoxCallback={setInfoBoxValues}/>
          <InfoBox isVisible={infoBoxVisible} data={infoBoxData} width={width/2 - width/44} height={width}/>
      </div>
    );
  }else{
    return <div></div>
  }

}

export default Graph;