import * as d3 from "d3";
import React, { useEffect, useState } from 'react';
import { select } from 'd3-selection';

export default function NodeGraph({
  data,
  width = 960,
  height = 960,
  infoBoxCallback
}) {
  //Scaling Values
  let  margin = width/48;
  const rectWidth = width/6;
  const rectHeight = width/12;
  const gxLocationFactor = rectWidth + margin
  const gyLocationFactor = rectHeight + margin * 2

  const [subCoords, setSubCoords] = useState(() => {

    let Semesters = [
      [],[],[],[],[],[],[],[]
    ];
    
    data.nodes.forEach((node) => {
      Semesters[node.semesterOrder-1].push(node);
    })

    let coords = [];
    Semesters.forEach( (sem, i) => {
      sem.forEach( (sub, j) => {coords.push( {subject : sub, xPos : j, yPos : i} ) } )
    });

    return coords;
  })

  useEffect(() => {
    let Semesters = [
      [],[],[],[],[],[],[],[]
    ];
    
    data.nodes.forEach((node) => {
      Semesters[node.semesterOrder-1].push(node);
    })

    let coords = [];
    Semesters.forEach( (sem, i) => {
      sem.forEach( (sub, j) => {coords.push( {subject : sub, xPos : j, yPos : i} ) } )
    });

    setSubCoords(coords);

  }, [data])

  console.log(data);

  function moveSubject(subCoord, yPos){
    let newCoords = [...subCoords];
    let subsInSem = subCoords.filter(s => s.yPos === yPos);
    let takenXpos = subsInSem.map(s => s.xPos);
    let xPos;
    let SemCredPoints = subsInSem.map(s=> s.subject).reduce((a, {creditPoints}) => a + creditPoints, 0);
    let newSubCoord = newCoords.find(s => s === subCoord);

    let parentsIds = data.links.filter((l) => l.target === subCoord.subject.subjectId).map(l => l.source);
    let childenIds = data.links.filter((l) => l.source === subCoord.subject.subjectId).map(l => l.target);
    var parentsYpos = Math.max(...subCoords.filter(s => parentsIds.includes(s.subject.subjectId)).map(c => c.yPos));
    var childrenYpos = Math.min(...subCoords.filter(s => childenIds.includes(s.subject.subjectId)).map(c => c.yPos));
    //console.log(parentsYpos)
    console.log(childrenYpos)
    
    if(yPos <=parentsYpos){
      alert("Cannot Place Subject Earlier than completion of it's prerequisites")
      setSubCoords(newCoords);
    }else if(yPos >=childrenYpos){
      alert("Subject must be completed earlier than dependent subjects")
      setSubCoords(newCoords);
    }
    else{
      if(subCoord.yPos === yPos){
        setSubCoords(newCoords);
      }
      else
      {
        if(SemCredPoints+subCoord.subject.creditPoints <= data.cpPerSem){
          for(let i = 0; i<=5; i++){
            if(!takenXpos.includes(i)){
              xPos = i;
              break;
            }
          }
          if(xPos !== undefined){
            newSubCoord.yPos = yPos;
          newSubCoord.xPos = xPos;
          setSubCoords(newCoords);
          }else{
          alert("Maximum of 6 subjects per semester")
          setSubCoords(newCoords);
          }
        }else{
        alert("Maximum of "+ data.cpPerSem + " credit points per semester")
        setSubCoords(newCoords);
        }
      }
    }
  }

  function showHideLines(event)
  {
    var paths = d3.select("svg").selectAll("path");
    if(event.target.checked){
      paths.attr("visibility", "visible")
    }else{
      paths.attr("visibility", "hidden")
    }
  }

  function highlightParents(subject){
    let parentsIds = data.links.filter((l) => l.target === subject.subjectId).map(l => l.source);

    var svg = d3.select("svg");

    var allG = svg.selectAll('.subject')
    d3.selectAll(allG).selectAll('rect').attr("fill", "lightblue"); 

    parentsIds.forEach(id =>{
      var selection = svg.selectAll(`g[data-id='${id}']`)
  
      d3.selectAll(selection).selectAll('rect').attr("fill", "lightgreen");
    })
  }

  function unhighlightAll(){
    var svg = d3.select("svg");
    var allG = svg.selectAll('.subject')
    d3.selectAll(allG).selectAll('rect').attr("fill", "lightblue"); 
  }

  useEffect(()=>{
    let dragGroup;
    let oldTransform; 

    const dragBehaviour = d3.drag().on('start', (event, d) => {
      dragGroup = select(event.sourceEvent.target).node().parentNode
      
      oldTransform = d3.select(dragGroup).attr('transform')
    })
    .on('drag', (event, d) => {
      d3.select(dragGroup).attr('transform', `translate(${event.x-rectWidth/2},${event.y-rectHeight/2})`);
    })
    .on('end', (event) => {
      var subCoord = subCoords.find(s => s.subject.subjectId === dragGroup.dataset.id);
      var yPos = Math.floor(event.y/gyLocationFactor);
      d3.select(dragGroup).attr('transform', oldTransform);

      moveSubject(subCoord, yPos);
    });

    //d3.selectAll("g").call(dragBehaviour)
    d3.select("svg").selectAll(".subject").call(dragBehaviour)
  })

  return (
    <div style={{width:width, float : 'left'}}>
      <input style={{position:"absolute"}} id="showLines" type="checkbox" defaultChecked="true" onChange={showHideLines}></input>
      <label style={{position:"absolute", left:"20px"}} htmlFor="showLines">Show Prerequsite Lines</label>
      <svg
      height={height}
      width={width}
      >
      { [...Array(Math.floor(height/gyLocationFactor))].map((val, i)  => (
        <g className="divider" key={"div #"+i}
        transform={`translate(0,${(i*gyLocationFactor)})`}>
          <rect 
          width={width} 
          height={gyLocationFactor} 
          //y={i*gyLocationFactor} 
          fill={"#" +  (230 - (i%2)*20).toString(16).repeat(3)  }>
          </rect>
          <text 
          //y={i*gyLocationFactor + margin}
          x={-gyLocationFactor/2}
          y={margin*1.2}
          fontWeight={"bold"}
          fontSize={width/48}
          textAnchor="middle"
          transform="rotate(-90)">
            {"Term: " + (i+1)}
          </text>
        </g>
      ))  }
      
      { subCoords.map( (subCoord, i) => (
        <g
          className="subject"

          key={i}
          data-id={subCoord.subject.subjectId}
          transform={`translate(${(subCoord.xPos*(gxLocationFactor))+margin*2},${(subCoord.yPos*gyLocationFactor)+margin})`}
          onClick={() => {infoBoxCallback(subCoord.subject)}}
          onMouseEnter={() => {highlightParents(subCoord.subject)}}
          onMouseLeave={unhighlightAll}
        >

          <rect
              width={rectWidth}
              height={rectHeight}
              fill='lightblue'
              stroke='blue'
              strokeWidth={width/512}
            ></rect>
            <text
              x={rectWidth/2}
              y={rectHeight/2}
              textAnchor="middle"
              fontSize={width/96}
              fontWeight={"bold"}
              transform="rotate(-3)"
              //textLength={rectWidth}
              //lengthAdjust={"spacingAndGlyphs"}
            >
              {subCoord.subject.subjectName}
            </text>
            <text
              x={rectWidth/2}
              y={rectHeight/2 + margin}
              textAnchor="middle"
              fontSize={width/96}
              fontWeight={"bold"}
            >
              {"Credit points: " + subCoord.subject.creditPoints}
            </text>
            
        </g>
      )) }
      { data.links.map( (link, i) => {
        let sourceNode = subCoords.find(n => n.subject.subjectId === link.source)
        let targetNode = subCoords.find(n => n.subject.subjectId === link.target)

        if(sourceNode){
          return <path
          key={i}
          d={`M ${((sourceNode.xPos*(gxLocationFactor))+margin)+rectWidth/2} ${((sourceNode.yPos*(gyLocationFactor))+margin)+rectHeight} 
          L ${((targetNode.xPos*(gxLocationFactor))+margin)+rectWidth/2+margin*2} ${(targetNode.yPos*(gyLocationFactor))+margin}`}
          stroke={"red"}
          strokeWidth={width/512}
          >
          </path>
        }
        return "";
      } ) }

    </svg>
    </div>
  )
}
