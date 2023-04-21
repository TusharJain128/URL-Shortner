import React, { useState } from 'react'
import axios from 'axios'
import './app.css'

export default function App(){

  const [longUrl, setLongUrl] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const createUrl = function(event){
    setLoading(true)
    axios.post(`http://localhost:3000/url/shorten`,{longUrl})
    .then((res)=>{
      setResult(res.data.message.shortUrl)
      setLoading(false)
    })
    .catch((err)=>{
      console.log(err.response.data.message)
      setLoading(false)
    })
  }

  const copyToClipboard = function() {
    navigator.clipboard.writeText(result);
  };

  return(
    <div align="center">
      <h3>Enter your Url here to convert</h3>
      <input placeholder="Enter your longUrl here...." onChange={(e)=>setLongUrl(e.target.value)}/><br/>
      <button className="submit" onClick={createUrl}>Submit</button>
      {loading && <p>Loading...</p>}
      {
        result ? (
          <div>
            <h3>{result}</h3>
            <button onClick={copyToClipboard}>Copy to Clipboard</button>
          </div>
        ) : null
      }  
      
    </div>
  )
}
