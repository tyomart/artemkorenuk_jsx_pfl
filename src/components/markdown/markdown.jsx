
import './markdown-styles.less'
import { useState, useContext, useEffect,  useLayoutEffect, useReducer } from 'react'
import $ from 'jquery';
import { json } from 'react-router-dom';

const log = console.log
const Markdown = () => {
   const initialPreIn  = `#z_#c_\n\`\`\`\n**[i_g**en](http://g_p**e.ru/8_.j) z\n\`\`\`d##! [google.com](http://goo_**x.com)fg_\n\`\`\`\n<**h##_i\n\`\`\`\nd![li_nk](http://ya_**x.ru) 12v_**`
    const [preIn, setPreIn] = useState(initialPreIn ) // inputing state
const [edit, setEdit] = useState('') // //what Shows in editor
const [readyTXT, setReadyTXT] = useState('') //Shows Output

let flags  = 
    {   
        inputOn: false,
        h1: true,
        h2: true,
        h3: true,
        h4: true,
        b: true,
        i: true,
        tr:true,
        td: true,
        th: true,
        ul: true,
        ol: true,
        li: true,
        code: true,
        //codeBlock: true,
        cacheSpec:'',
        
        test:false, //test flag
    } 

const breakLines = (txt) => {

    return txt.split('\n')
}
// TO DO makes negative groups for 2 backticks and 3 backticks
const convert = (proTag ) => { //cash, char, j, txtAr

    const tagOpClos = (tag) => { // open/closed tag substitution
        //exclusion cases are expected here
       return !flags[`${tag}`]         //basic case
            ? `<${tag}>` : `</${tag}>`   
    }
   
    // tag cases
    if (proTag === '#' )                     // <h1> ///tag && txtAr[json-1] === '\n'
            {log('# fired')
            flags = {...flags, h1:!(flags.h1)}
            return tagOpClos('h1');
            }
    if (proTag === '##')                     // <h1> tag
            {log('## fired')
                flags = {...flags, h2:!(flags.h2)}
            return tagOpClos('h2');
            }
    if (proTag === '###')                     // <h1> tag
            {log('### fired')
            flags = {...flags, h3:!(flags.h3)}
            return tagOpClos('h3');
            }
    if (proTag === '####')                     // <h1> tag
            {log('#### fired')
            flags = {...flags, h4:!(flags.h4)}
            return tagOpClos('h4');
            }
    if (proTag === '**')                     // <h1> tag
            {
                flags = {...flags, b:!(flags.b)}
            return tagOpClos('b');
            }
    if (proTag === '_')                     // <h1> tag
            {
                flags = {...flags, i:!(flags.i)}
            return tagOpClos('i');
            }
       
    if (proTag === '\`')                     // <h1> tag
            {
                flags = {...flags, code:!(flags.code)}
            return tagOpClos('code');
            }
    // if (proTag === '\`\`\`')                     // <h1> tag
    //         {
    //             flags = {...flags, codeBlock:!(flags.codeBlock)}
    //         return tagOpClos('code'); // replace 'codeBlock' to 'code'
    //         }
    if (proTag === 'ul')                     // <h1> tag
            {
                flags = {...flags, ul:!(flags.ul)}
            return tagOpClos('ul');
            }
    if (proTag === 'li')                     // <h1> tag
            {
                flags = {...flags, li:!(flags.li)}
            return tagOpClos('li');
            }
        if (proTag === 'ol')                     // <h1> tag
                {
                    flags = {...flags, ol:!(flags.ol)}
                return tagOpClos('ol');
                }
        if (proTag === 'th')                     // <h1> tag
                {
                    flags = {...flags, codeBlock:!(flags.codeBlock)}
                return tagOpClos('code');
                }
        if (proTag === 'td')                     // <h1> tag
                {
                    flags = {...flags, codeBlock:!(flags.codeBlock)}
                return tagOpClos('code');
                }
        if (proTag === 'tr')                     // <h1> tag
                {
                    flags = {...flags, tr:!(flags.tr)}
                return tagOpClos('tr');
                }
        if (proTag === ' ')                     // <h1> tag
        {
            
        return ' '
        }
    }  

const convertEndStr = (txt) => {
//   log('convertEnd')
    if (flags.h1===false) {
        flags = {...flags, h1:!(flags.h1)}
        return txt.replace(/$/, '</h1><hr/><br/>\n')
    } 
    else  if (flags.h2===false) {
        flags = {...flags, h2:!(flags.h2)} 
        return txt.replace(/$/, '</h2><hr/><br/>\n')
    }
    else  if (flags.h3===false) {
        return txt.replace(/$/, '</h3><br/>\n')
    }
    else  if (flags.h4===false) {
        return txt.replace(/$/,  '</h4><br/>\n')
    }
    else return txt.replace(/^/,  '<p>').replace(/$/,'</p>')
} 
const convertCodeBlock = (txt) => {
    
        txt = txt.replace(/\n/gm, '<br/>')
        return txt
    }
const headerReplace = (txt) => {
    txt = txt.match(/^####.*$/) ? txt.replace(/^####/, convert('####')) : txt
    txt = txt.match(/^###.*$/) ? txt.replace(/^###/, convert('###')) : txt
    txt = txt.match(/^##.*$/) ? txt.replace(/^##/, convert('##')) : txt
    txt = txt.match(/^#.*$/) ? txt.replace(/^#/, convert('#')) : txt
    return txt
   }

const uniReplace = (txt, type) => { // use marker for replace, and use actually text situation as '>' -> />\s/ for blockquote
    let regex = '', toTag = ''
    
    switch (type) {
        case 'b': regex = /\*\*/;  toTag = '**';break
        case 'i': regex = /\_/;  toTag = '_';break
        case '\`': regex = /(?<![`\\])`(?!`)/;  toTag = '`';break;
        case 'ul': regex = /\-/;  toTag = 'ul';break
        case '>': regex = /\>\s/;  toTag = 'blockquote';break
        default: regex = /\`/;  toTag = '';break;
    }

    if (toTag.length === 0) 
        return txt
   
    else {
        if (txt.match(regex)) { //(txt.match(/.*\*\*/))
        
            txt = txt.replace(regex, convert(toTag))
            
        return uniReplace(txt, type)
        }
        else {
            //log('txt else', txt)
            return txt}

    }
    
}

const linkPlaceholdReplace = (txt,type) => {

    let regex = ''; let stub = ''
    switch (type){
        case 'link': regex = /\[(.*?)\]\((.*?)\)/g ; stub = '©©©';break;
        case 'img': regex = /\!\[(.*?)\]\((.*?)\)/g ; stub = '©~©';break;
        case 'code': regex = /(<code>[\s\S]*?<\/code>)/gm ; stub = '©~<CODE>~©';break;
       
    }   
    let matching =  txt.match(regex)
    let storageLink = matching !== null ? matching.reduce((acc,elem)=>{return [...acc, elem]},[]) : []  // collect links
    txt = txt.replace( regex, stub)

    return [txt, storageLink]
}

const linkInverseReplace  = (txt, store, type) =>  { // Invert Links Conversion
    // log('inverse replace', type)
    let regexStub = ''
    switch(type){
        case 'link':  regexStub = '©©©'; break
        case 'img':  regexStub = '©~©'; break
        case 'code':  regexStub = '©~<CODE>~©'; break
    
        default:  regexStub = ''; break
    }

    let regexGlob = new RegExp(regexStub,'g'); let regexNoGlob = new RegExp(regexStub);
    return store.length > 0 
    ?   store.reduce((acc,elem) => {  

            let matchCPR = txt.match(regexGlob) 

                if (matchCPR!==null) 
                    { txt = txt.replace(regexNoGlob, elem);
                            // log('inversed', txt )
                    return acc = txt}
                else return acc = txt
        }, '' ) 
    :txt;} // end of ternary 

const linkInverseReplace0  = (txt, store, type) =>  { // Invert Links Conversion
   
        return store.length > 0 
        ?   store.reduce((acc,elem) => {  
              
                let matchCPR = txt.match(/©~<CODE>~©/g) 
    
                    if (matchCPR!==null) 
                        { txt = txt.replace(/©~<CODE>~©/, elem);
                        return acc = txt}
                    else return acc = txt
            }, '' ) 
        :txt;} // end of ternary 

const makeHtml = (txt,type) => {                // LInk Invert conversion   // 

    let regexToMatch = '';  let regexToHtml=  '';  let  regexToSubstGroups = ""; 
    switch(type) {
        case 'link': 
            regexToMatch =  /\[(.*?)\]\((.*?)\)/; 
            regexToHtml =   /\[(?<link>[^\]]+)\]\((?<url>[^)]+)\)/  ;
            regexToSubstGroups = `<a href="$<url>">$<link></a>`;
            break;
        case 'img': 
            regexToMatch = /\!\[(.*?)\]\((.*?)\)/ 
            regexToHtml=   /\!\[(?<alt>[^\]]+)\]\((?<url>[^)]+)\)/   
            regexToSubstGroups = `<img src="$<url>" alt="$<alt>"/>`;
            break;
        case 'code': 
            regexToMatch = /\n```\n[\s\S]*?\n```\n/gm
            regexToHtml=   /\n```\n(?<codeRGX>[\s\S]*?)\n```\n/gm 
            regexToSubstGroups = `\n<code>$<codeRGX></code>\n`;
            break;
        case 'quote': 
            regexToMatch = />\s[\s\S]*?\n/gm
            regexToHtml=   />\s(?<quote>[\s\S]*?)\n/m 
            regexToSubstGroups = `\n<blockquote>| $<quote></blockquote><br/>\n`;
            break;
 
    }
    // type = 'quote' ? log('replace quoe', txt.replace(regexToHtml, `\n<blockquote>$<quote></blockquote><br/>\n`)) : log('')
    let matching = txt.match(regexToMatch) ;
    if (matching !== null) { 
        txt = txt.replace(regexToHtml, type === 'code'? `\n<code>` + convertCodeBlock(matching[0]) + `</code>\n` : regexToSubstGroups  
        )

    return makeHtml(txt, type)
}
else return txt 
    }
 

  // process -> ###s -> withBracketsReplace -> etc foos -> return process

  // withBracketsExchange -> linkPlaceholdReplace, imgPlaceholdReplace, -> i-b change -> makeLinks (back) -> makeHtmlLinks -> return txt

const process = (inStr) => { // main processor is uniReplace // linkPlace,Inverse,makeHtml to bypass with code blocks

    const withBracketsReplace  = (preStr) => {
        

       let [pre1str,storeImgs] =   linkPlaceholdReplace(preStr, 'img') 
       let [str,storeLinks] =   linkPlaceholdReplace(pre1str, 'link')  

// -------- // uniReplace block ----------------- // transmit just marker of further replace
        str = uniReplace(str,'b')   
        str = uniReplace(str,'i')   
        str = uniReplace(str,'`')   
        str = uniReplace(str,'>')   
// ----------// // uniReplace block -------------


        // //get back transformed brackets
        str = linkInverseReplace (str,storeImgs, 'img' )
        str = linkInverseReplace (str,storeLinks, 'link')
      
      
         str = makeHtml(str, 'img')
         str = makeHtml(str, 'link')
  
        return str
        } // withBracketsReplace end

       
   inStr = withBracketsReplace(inStr)  // actions and replacing with brackets

// header replace
  inStr = headerReplace(inStr)
 
    inStr = convertEndStr(inStr);
return inStr // return of process()
}

const bufferPreTxt = (inStr) => { 
    // b-InStr - ``` to <code> // c_InStr hides <code> // other replacing // d_InStr - unhide back <code)

    let b_InStr = makeHtml(preIn, 'code')
    let [c_InStr, store] = linkPlaceholdReplace(b_InStr, 'code')

    c_InStr = breakLines(c_InStr).map(str => process(str)).join('') 
    let d_InStr =  linkInverseReplace0(c_InStr, store, 'code')
    let e_InStr = makeHtml(inStr, 'quote')
    return  e_InStr
}

const handleIn = (e) => {

    const inputString = e.target.value
    setPreIn(inputString)
    return 
}
// make stubs OOO -> process text -> inverse to HTML
const handleTest = () => { // --------------------------------TEST BUTTON -------------------------------------------------------------------
   
    // let aTest = `#z_#c_\n\`\`\`\n**[i_g**en](http://g_p**e.ru/8_.j) z\n [google.com](http://goo_**x.com)
    //                  fg_n<**h##_i\n\`\`\`\nd![li_nk](http://ya_**x.ru) 12v_**`
   
  
    // return log( '\n',aTest )
}

useLayoutEffect(()=>{                 //triggering Text Processor and sync editor and ReadyTXT

    if (preIn.length >0) { // to not send empties in state

        
        setEdit(preIn) ; //log('preIn in Fx', preIn)
       
        // setTimeout(5000)
        setReadyTXT(bufferPreTxt(preIn)) // TO DO make code blocks
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



{/* <div>Markdown (under construct.)</div> */}


<div> <button onClick ={handleTest}>TEST</button></div>

</>
}

export default Markdown;


