//import * as d3 from "d3";
//import { isoParse } from 'd3';
//import React, { useEffect, useState } from 'react';
//import { select } from 'd3-selection';




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

// 2  | 1200  600 , 960 480
// 3  | 1200  400 , 960 320
// 4  | 1200  300 , 960 240
// 6  | 1200  200 , 960 160
// 10 | 1200  120 , 960 96
// 12 | 1200  100 , 960 80
// 16 | 1200  75  , 960 60
// 20 | 1200  60  , 960 48
// 24 | 1200  50  , 960 40
// 48 | 1200  25  , 960 20
export default function NodeGraph({
  data,
  width = 960,
  height = 960
}) {  
  console.log("ran");

  //Scaling Values
  let  margin = width/48;
  const rectWidth = width/6;
  const rectHeight = width/12;
  const gxLocationFactor = rectWidth + margin
  const gyLocationFactor = rectHeight + margin * 2
  
  
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
  
  Semesters.forEach( (sem, i) => {
    sem.forEach( (sub, j) => {sub.xPos = j; sub.yPos=i} )
  } )  



  return (<svg
    height={height}
    width={width}
    >
    { data.nodes.map( (subject, i) => (
      <g
        key={i}
        data-id={subject.subjectId}
        transform={`translate(${(subject.xPos*(gxLocationFactor))+margin},${(subject.yPos*gyLocationFactor)+margin})`}
        onClick={() => console.log("Hello World")}
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
            {subject.subjectName}
          </text>
          <text
            x={rectWidth/2}
            y={rectHeight/2 + margin}
            textAnchor="middle"
            fontSize={width/96}
            fontWeight={"bold"}
          >
            {"Credit points: " + subject.creditPoints}
          </text>
      </g>
    )) }
    { data.links.map( (link, i) => {
      let sourceNode = data.nodes.find(n => n.subjectId === link.source)
      let targetNode = data.nodes.find(n => n.subjectId === link.target)

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
