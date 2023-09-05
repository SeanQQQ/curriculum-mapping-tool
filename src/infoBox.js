export default function InfoBox({
    data,
    isVisible,
    width,
    height
}) {  
    
    if(isVisible){
        return(<iframe style={{float:"left"}} title="Subject Information" width={width-width/58} height={height} src={"https://handbook.uts.edu.au/subjects/"+ data.subjectId +".html"}  ></iframe>)
    }else{
        return (<div style={{padding:5,float:"left"}}><p style={{margin:"0px"}}><b>Click on a subject to show details</b></p></div>)
    }
  }
  