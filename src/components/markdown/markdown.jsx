
import './markdown-styles.less'
import { useState, useContext, useEffect,  useLayoutEffect, useReducer } from 'react'
import $ from 'jquery';

const log = console.log
const Markdown = () => {

    const [preIn, setPreIn] = useState('') // inputing state
const [edit, setEdit] = useState('') // //what Shows in editor
const [readyTXT, setReadyTXT] = useState('') //Shows Output

//let cacheSpec = ''
let flags  = 
    {   
        h1: true,
        h2: true,
        h3: true,
        b: true,
        i: true,
        cacheSpec:'',
        
        test:false, //test flag
    } 

const special = (testedChar) => {
        
    const specialSet = ['*','\\','\`','#','i','[',']', '|']
   return  Boolean(specialSet.reduce((acc,elem) => { return acc=acc+(elem===testedChar)} ,false))
}


const convert = (char,cash) => {

   
    const proTag= cash.length >0 || cash === undefined ? cash + char : char
    const tagOpClos = (tag) => { // open/closed tag substitution
        
        //exclusion cases are expected here

       // log('outval fired')
       return !flags[`${tag}`]         //basic case
            ? `<${tag}>` : `</${tag}>`   
    }
   
    // tag cases
    if (proTag === '#')                     // <h1> tag
            {log('# fired')
            flags = {...flags, h1:!(flags.h1),  cacheSpec:''}
            return tagOpClos('h1',0);
            }
    if (proTag === '##')                     // <h1> tag
            {log('## fired')
                flags = {...flags, h2:!(flags.h2), cacheSpec:''}
            return tagOpClos('h2',0);
            }
    if (proTag === '###')                     // <h1> tag
            {log('# fired')
            flags = {...flags, h3:!(flags.h3), cacheSpec:''}
            return tagOpClos('h3',0);
            }
    if (proTag === '**')                     // <h1> tag
            {
                flags = {...flags, b:!(flags.b), cacheSpec:''}
            return tagOpClos('b',0);
            }
  
    else return proTag
}
const testTXT = (txt) => {
  
    return txt.split('').reduce((acc,char,i,txtArr) => {
        if (special(char) === true) {

            if (txtArr[i+1] === char) { // M-conversion
                
                flags.cacheSpec = flags.cacheSpec+ char
                return acc // 000-conversion
            }
         
           else {
                
            return acc = acc + convert(char, flags.cacheSpec) // 1-conversion
            }
        }
        else { ;return acc =  acc + char} //0-conversion

    },'')

}

const handleIn = (e) => {
   
    const inputString = e.target.value
    setPreIn(inputString)

    return 
}

const handleTest = () => {

    let cca = '789'
    const aTest = '01#23##45##67#89'

    log('proc2', '\n', testTXT(aTest) )
   
    return 
}

useLayoutEffect(()=>{                 //triggering Text Processor and sync editor and ReadyTXT

    if (preIn.length >0) { // to not send empties in state

  
        setEdit(preIn)

        setReadyTXT(testTXT(preIn))
    }
    else {log('empties')}
},[preIn])




useLayoutEffect(()=>{                 //parser HTML, uses 'output' id in <div> at Display
   
    const $outP = $('#output') 
    const html = $outP.html()
    const newHtml = html + readyTXT
    $outP.html(newHtml)
   return 
},[readyTXT])

// Components for out ----------------------

const HtmlView = (props) => {  //const { eDisp }  = props
  
    // HTML RETURN
    return <>
       <div id='html_view'><p>{readyTXT}</p></div> 
    </>
} 
const Preview = (props) => {  //const { eDisp }  = props
  
    // PREVIEW RETURN
    return <>
       <div id='output'><p>{}</p></div> 
    </>
} 

//BIG RETURN before OUTPUT ---------------------------------
    return <> 

    <div>Markdown (under construct.)</div>
        <div id='editor'>editor
        <div id='input-wrapper'>
        <label>
            <textarea id='editor-area' value ={preIn}  onChange={handleIn}></textarea> 
            {/* onKeyDown ={handleBS} */}
        </label>
        
        </div>
    
    </div>
    <div id='html-view-area'> <div id='html-area-header'>HTML</div> <br/>
        <HtmlView htmlDisp = {readyTXT}></HtmlView>

    </div>
    <br></br>
    <div id='preview'>
       
 
        <Preview eDisp={readyTXT}/> 
    </div> 



<div>Markdown (under construct.)</div>


<div> <button onClick ={handleTest}>TEST</button></div>

</>
}

export default Markdown;


