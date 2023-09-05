import React, { useEffect, useState } from 'react';
import './index.css';
import NodeGraph from './NodeGraph';
import InfoBox from './infoBox';


function Graph( {width} ) {
  const [data, setData] = useState(null);
  const [courseData, setCourseData] = useState(null);
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
  }

  useEffect(() => {
    fetch('https://curriculummappingapi.azurewebsites.net/Subject?CourseId=' + courseId)
      .then((res) => res.json())
      .then((d) => {
        setData({ nodes: d.subjects, links: d.links });
        console.log(d);
      });
  }, [courseId]);

  useEffect(() => {
    fetch('https://curriculummappingapi.azurewebsites.net/Course')
      .then((res) => res.json())
      .then((d) => {
        setCourseData(d.courses);
        setCourseId(d.courses[0].courseId)
        console.log(d);
      });
  }, []);

  if(data && courseData){
    return (
      <div className="App">
        <div><select onChange={handleSelect}>
          {courseData.map((course) => (
            <option value={course.courseId}>{course.courseName}</option>
          ) )}
        </select> </div><br/>
          <NodeGraph data={data} width={width/2} height={width} infoBoxCallback={setInfoBoxValues}/>
          <InfoBox isVisible={infoBoxVisible} data={infoBoxData} width={width/2 - width/48} height={width}/>
      </div>
    );
  }else{
    return <div></div>
  }

}

export default Graph;