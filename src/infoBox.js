export default function InfoBox({
    data,
    isVisible,
    width,
    height
}) {  
    
    if(isVisible){
        return(<iframe title="Subject Information" width={width} height={height} src={"https://handbook.uts.edu.au/subjects/"+ data.subjectId +".html"}  ></iframe>)
    }else{
        return (<div></div>)
    }
  }
  