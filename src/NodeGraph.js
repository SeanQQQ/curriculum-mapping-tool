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
  const rectWidth = width/8;
  const rectHeight = width/12;
  
  useEffect(()=> {
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
          currSem++
        }
        Semesters[currSem].push(element);
      }
    });

    console.log(Semesters);


    
    const svg = d3.select(ref.current);
    
    const g = svg.selectAll("g")

    Semesters.forEach((e, i) => {
      g.data(e).enter().append("g")
      .attr("transform", d => ("translate(" + ((e.indexOf(d)*width/6)+margin) + "," + (i*(height/10) + margin) + ")" ))
      .attr('data-id', d => d.subjectId);
    })

    // let rectHolders = svg.selectAll("g").data(data.nodes).join("g")
    // .attr("transform", d => ("translate(" + (data.nodes.indexOf(d)*(width/4) + margin)%width + "," + ((Math.floor(data.nodes.indexOf(d)/4))*(height/10) + margin) + ")"))
    // .on('click', (e, d) => console.log(d.name))
    // .attr('data-id', d => d.subjectId);

    
    let rectHolders = svg.selectAll("g");

    let rectangles = rectHolders.append("rect")
      .attr("stroke", "blue")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr('data-id', d => d.subjectId)
      .attr("fill-opacity", "0.5")
      .attr("fill", "lightblue")
    
    rectHolders.append("text")
      .text( d => d.subjectName)
      .style("font-size", "8px")
      .attr('x', rectWidth/2)
      .attr('y', rectHeight/2)
      .attr('text-anchor', "middle")      
      .attr("font-weight", "bold");
    
    svg.selectAll("path")
    .append("path")
      .data(data.links)
      .join("path")
      .attr("class", "link")
      .attr("d", d => {
        let sourcegroup = rectHolders.nodes().find(c => c.__data__.subjectId === d.source)
        let targetgoup = rectHolders.nodes().find(c => c.__data__.subjectId === d.target)
        let sourceRect = rectangles.nodes().find( c => c.__data__.subjectId === d.source);
        let targetRect = rectangles.nodes().find( c => c.__data__.subjectId === d.target);
        
        if(sourcegroup){
          let sourcex = parseFloat(sourcegroup.getAttribute("transform").match(/translate\(([^,]+),/)[1]) + parseFloat(sourceRect.getAttribute('width'))/2;
          let sourcey = parseFloat(sourcegroup.getAttribute("transform").match(/translate\([^,]+,\s*([^)]+)\)/)[1]) + parseFloat(sourceRect.getAttribute('height'));
  
          let targetx = parseFloat(targetgoup.getAttribute("transform").match(/translate\(([^,]+),/)[1]) + parseFloat(targetRect.getAttribute('width'))/2;
          let targety = parseFloat(targetgoup.getAttribute("transform").match(/translate\([^,]+,\s*([^)]+)\)/)[1]);
        
          return `M${sourcex},${sourcey} ${targetx},${targety}`;
        }
      })
      .style("fill", "black")
      .style("stroke", "red")
      }, []
  )

  return (<svg 
    ref={ref}
    width={width}
    height={height}
   />)
}

//data format:
//data = { nodes:[], links:[] }

// node = {id, name, creditPointsm}

// link = {source, target}