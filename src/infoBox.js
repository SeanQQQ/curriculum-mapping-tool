//import * as d3 from "d3";
//import { isoParse } from 'd3';
//import React, { useEffect, useState } from 'react';
//import { select } from 'd3-selection';

export default function InfoBox({
    data,
    isVisible,
    width,
    height
}) {  
    
    if(isVisible){
        return(<iframe title="Subject Information" width={width} height={height} src={"https://handbook.uts.edu.au/subjects/"+ data.subjectId +".html"} ></iframe>)
    }else{
        return (<div></div>)
    }
  }
  