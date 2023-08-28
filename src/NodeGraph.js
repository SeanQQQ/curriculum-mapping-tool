import * as d3 from "d3";
import React, { useEffect, useState } from 'react';
import { select } from 'd3-selection';

function placeSubjectChains(subNode, subjects, links, placed, semesters, currSem, idealPos){
  let children = links.filter((l) => l.source === subNode.subjectId).map(l => subjects.find(sub => sub.subjectId === l.target));
  let parents = links.filter((l) => l.target === subNode.subjectId).map(l => subjects.find(sub => sub.subjectId === l.source));
  let semPos = 0;
  
  let allParentsPlaced = true;
  for(var i = 0; i<parents.length; i++){
    if(!placed.includes(parents[i])){
      allParentsPlaced = false;
      break;
    } 
  }
  
  if(allParentsPlaced){
    let isPlaced = false;
    while(!isPlaced){
      if(semesters[currSem].reduce((a, {creditPoints}) => a + creditPoints, 0) + subNode.creditPoints <= 24){
        if(!semesters[currSem][idealPos]){
          semesters[currSem][idealPos] = subNode;
          placed.push(subNode);
          isPlaced = true;
          semPos = idealPos
        }else{
          while(!isPlaced){
            if(!semesters[currSem][semPos]){
              semesters[currSem][semPos] = subNode;
              placed.push(subNode);
              isPlaced = true;
            }else{
              semPos++;
            }
          }
        }
      }
      else{
        currSem++;
      }
    }
  
    children.forEach(linkedSub => {
      if(!placed.includes(linkedSub)){
        placeSubjectChains(linkedSub, subjects, links, placed, semesters, currSem+1, semPos);
      }
    })
  }
}


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
    
    let rootSubs = data.nodes.filter((sub) => sub.rootDescendenceDepth > 0);
  
    let placed = [];
    rootSubs.forEach((subject) => {
      placeSubjectChains(subject, data.nodes, data.links, placed, Semesters, 0, 0)
    })
  
    var floatingSubjects = data.nodes.filter(sub =>  !placed.includes(sub))
  
    let semIndex = 0
    floatingSubjects.forEach(element => {
      if(Semesters[semIndex].length === 0){
        Semesters[semIndex].push(element);
      }else{      
        let placed = false;
        while(!placed){
          if(Semesters[semIndex].reduce((a, {creditPoints}) => a + creditPoints, 0) + element.creditPoints > 24){
            semIndex++;
          }else{
            let semLength = Semesters[semIndex].length
            for(var i = 0; i <=semLength; i++){
              if(!Semesters[semIndex][i]){
                Semesters[semIndex][i] = element;
                placed = true;
                break;
              }
            }
          }
        }  
      }
    });

    let coords = [];
    Semesters.forEach( (sem, i) => {
      sem.forEach( (sub, j) => {coords.push( {subject : sub, xPos : j, yPos : i} ) } )
    });

    return coords;
  })

  function moveSubject(subCoord, yPos){
    let newCoords = [...subCoords];
    let subsInSem = subCoords.filter(s => s.yPos === yPos);
    let takenXpos = subsInSem.map(s => s.xPos);
    let xPos;
    let SemCredPoints = subsInSem.map(s=> s.subject).reduce((a, {creditPoints}) => a + creditPoints, 0);
    let newSubCoord = newCoords.find(s => s === subCoord);

    if(subCoord.yPos === yPos){
      setSubCoords(newCoords);
    }else{
      debugger;
      if(SemCredPoints+subCoord.subject.creditPoints <= 24){
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
        alert("Maximum of 24 credit points per semester")
        setSubCoords(newCoords);
      }
    }
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

    d3.selectAll("g").call(dragBehaviour)
  })

  console.log(subCoords);

  return (
    <svg
    height={height}
    width={width}
    >
    { subCoords.map( (subCoord, i) => (
      <g
        key={i}
        data-id={subCoord.subject.subjectId}
        transform={`translate(${(subCoord.xPos*(gxLocationFactor))+margin},${(subCoord.yPos*gyLocationFactor)+margin})`}
        onClick={() => {infoBoxCallback(subCoord.subject)}}
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

  </svg>)
}
