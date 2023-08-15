import * as d3 from "d3";
import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';

export default function NodeGraph({
  data,
  width = 960,
  height = 960
}) {

  
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
  
  const ref = useRef();
  
  const margin = width/48;
  const rectWidth = width/6;
  const rectHeight = width/12;
  const gxLocationFactor = rectWidth + margin
  const gyLocationFactor = rectHeight + margin * 2

  if(!data) {
    return;
  }
  let Semesters = [
    [],[],[],[],[],[],[],[]
  ];

  let currSem = 0
  data.nodes.forEach(element => {
    if(Semesters[currSem].length == 0){
      Semesters[currSem].push(element);
    }else{        
      if(Semesters[currSem].reduce((a, {creditPoints}) => a + creditPoints, 0) + element.creditPoints > 24){
        currSem++;
      }
      Semesters[currSem].push(element);
    }
  });

  Semesters.forEach( (sem, i) => {
    sem.forEach( (sub, j) => {sub.xPos = j; sub.yPos=i} )
  } )

  console.log(Semesters);
  
  return (<svg
    height={height}
    width={width}
  >
    { data.nodes.map( (subject) => (
      <g
        data-id={subject.subjectId}
        transform={`translate(${(subject.xPos*(gxLocationFactor))+margin},${(subject.yPos*gyLocationFactor)+margin})`}
      >
        <rect
            width={rectWidth}
            height={rectHeight}
            fill='lightblue'
            stroke='blue'
            strokeWidth={3}
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
      </g>
    )) }
    { data.links.map( (link) => {
      let sourceNode = data.nodes.find(n => n.subjectId == link.source)
      let targetNode = data.nodes.find(n => n.subjectId == link.target)

      if(sourceNode){
        return <path
        d={`M ${((sourceNode.xPos*(gxLocationFactor))+margin)+rectWidth/2} ${((sourceNode.yPos*(gyLocationFactor))+margin)+rectHeight} 
        L ${((targetNode.xPos*(gxLocationFactor))+margin)+rectWidth/2} ${(targetNode.yPos*(gyLocationFactor))+margin}`}
        stroke={"red"}
        >
        </path>
      }
    } ) }

  </svg>)
}
