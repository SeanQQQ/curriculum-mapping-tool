import * as d3 from "d3";
import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';

export default function NodeGraph({
  data,
  width = 1600,
  height = 800
}) {

  const ref = useRef();

  useEffect(()=> {
    const svg = d3.select(ref.current);
    let rectHolders = svg.selectAll("g").data(data.nodes).join("g")
    .attr("transform", d => ("translate(" + (data.nodes.indexOf(d)*(width/4))%width + "," + (20+(Math.ceil((data.nodes.indexOf(d)+1)/4)-1)*(height/10)) + ")"))
    .on('click', (e, d) => console.log(d.name))
    .attr('data-id', d => d.id);

    rectHolders.append("rect")
      .attr("stroke", "blue")
      .attr("width", width/12)
      .attr("height", width/24)
      .attr('data-id', d => d.id)
      .attr("fill-opacity", "0")
    
    
    rectHolders.append("text")
      .text( d => d.name)
      .style("font-size", "11px")
      .attr('x', width/12 /2)
      .attr('y', width/24 / 2)
      .attr('text-anchor', "middle")      
      .attr("font-weight", "bold");

    ;
    
    let rectangles = svg.selectAll("rect")
    // .data(data.nodes).join("rect")
    // .attr("x", d => data.nodes.indexOf(d)*60 + 10)
    // .attr("y",  d => data.nodes.indexOf(d)+ 70)
    // .attr("width", 40)
    // .attr("height", 20)
    // .attr('data-id', d => d.id)
    // .attr("fill", "none")
    // .attr("stroke", "red");

    svg.selectAll("path")
    .append("path")
      .data(data.links)
      .join("path")
      .attr("class", "link")
      .attr("d", d => {
        let sourcegroup = rectHolders.nodes().find(c => c.__data__.id === d.source)
        let targetgoup = rectHolders.nodes().find(c => c.__data__.id === d.target)
        let sourceRect = rectangles.nodes().find( c => c.__data__.id === d.source);
        let targetRect = rectangles.nodes().find( c => c.__data__.id === d.target);
        
        let sourcex = parseFloat(sourcegroup.getAttribute("transform").match(/translate\(([^,]+),/)[1]) + parseFloat(sourceRect.getAttribute('width'))/2;
        let sourcey = parseFloat(sourcegroup.getAttribute("transform").match(/translate\([^,]+,\s*([^)]+)\)/)[1]) + parseFloat(sourceRect.getAttribute('height')/2);

        let targetx = parseFloat(targetgoup.getAttribute("transform").match(/translate\(([^,]+),/)[1]) + parseFloat(targetRect.getAttribute('width'))/2;
        let targety = parseFloat(targetgoup.getAttribute("transform").match(/translate\([^,]+,\s*([^)]+)\)/)[1]);        

        const dx = targetx - sourcex;
        const dy = targety - sourcey;
        const dr = Math.sqrt(dx * dx + dy * dy);

        return `M${sourcex},${sourcey} ${targetx},${targety}`; //`M${sourcex},${sourcey}A${1},${.2} 0,0,0 ${targetx},${targety}`; for arcs 
      })
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("marker-end", "url(#head)")
  }
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