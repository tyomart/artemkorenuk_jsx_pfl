
import './markdown-styles.less'
import { useState, useContext, useEffect,  useLayoutEffect, useReducer } from 'react'
import $ from 'jquery';
import { json } from 'react-router-dom';

const log = console.log
const Markdown = () => {

    const [preIn, setPreIn] = useState('') // inputing state
const [edit, setEdit] = useState('') // //what Shows in editor
const [readyTXT, setReadyTXT] = useState('') //Shows Output

let flags  = 
    {   
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
    if (proTag === '\`\`\`')                     // <h1> tag
            {
                flags = {...flags, codeBlock:!(flags.codeBlock)}
            return tagOpClos('code'); // replace 'codeBlock' to 'code'
            }
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

const convertEndStr = () => {
//   log('convertEnd')
    if (flags.h1===false) {
        return '</h1><hr/>br/>'
    } 
    else  if (flags.h2===false) {
        return '</h2><hr/><br/>\n'
    }
    else  if (flags.h3===false) {
        return '</h3><br/>'
    }
    else  if (flags.h4===false) {
        return '</h4><br/>'
    }
    else return ''
} 


const uniReplace = (txt, type) => {
    let regex = '', toTag = ''
    
    switch (type) {
        case 'b': regex = /\*\*/;  toTag = '**';break
        case 'i': regex = /\_/;  toTag = '_';break
        case '\`': regex = /\`/;  toTag = '`';break;
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

  // process -> ###s -> withBracketsReplace -> etc foos -> return process

  // withBracketsExchange -> linkPlaceholdReplace, imgPlaceholdReplace, -> i-b change -> makeLinks (back) -> makeHtmlLinks -> return txt
const process = (inStr) => {

    

    const withBracksReplace  = (preStr) => {
        
        const linkPlaceholdReplace = (txt,type) => {

            let regex = ''; let stub = ''
            switch (type){
                case 'link': regex = /\[(.*?)\]\((.*?)\)/g ; stub = '©©©';break;
                case 'img': regex = /\!\[(.*?)\]\((.*?)\)/g ; stub = '©~©';break;
                // case 'code': regex = /^\`\`\`(.*?)\]\((.*?)\)/g ; stub = '©~coblock~©';break;
            }   
            let matching =  txt.match(regex)
            let storageLink = matching !== null ? matching.reduce((acc,elem)=>{return [...acc, elem]},[]) : []  // collect links
            txt = txt.replace( regex, stub)
        
            return [txt, storageLink]
        }

        const linkInverseReplace  = (txt, store, type) =>  { // Invert Links Conversion

            let regexStub = ''
            switch(type){
                case 'link':  regexStub = '©©©'; break
                case 'img':  regexStub = '©~©'; break
                // case 'code1':  regexStub = '©~coblock~©'; break
                default:  regexStub = ''; break
            }

            let regexGlob = new RegExp(regexStub,'g'); let regexNoGlob = new RegExp(regexStub);
            return store.length > 0 
            ? store.reduce((acc,elem) => {  

                let matchCPR = txt.match(regexGlob) 

                if (matchCPR!==null) 
                    { txt = txt.replace(regexNoGlob, elem);
                    return acc = txt}
                else return acc = txt
            }, '' ) 
        :txt;} // end of ternary 

        const makeHtml = (txt,type) => {                // LInk Invert conversion   
       
        let regexToMatch = '';  let regexToHtml=  '';  let  regexToSubstGroups = ""; 
        switch(type) {
            case 'link': 
                regexToMatch =  /\[(.*?)\]\((.*?)\)/g; //log('link fired', txt.match(regexToMatch)); 
                regexToHtml =   /(?<txt1>[^[]+)\[(?<link>[^\]]+)\]\((?<url>[^)]+)\)(?<txt2>[^[]+)/g  ;
                regexToSubstGroups = `$<txt1><a href="$<url>">$<link></a>$<txt2>`;
                break;
            case 'img': 
                regexToMatch = /\!\[(.*?)\]\((.*?)\)/g 
                regexToHtml=   /(?<txt1>[^[]+)\!\[(?<alt>[^\]]+)\]\((?<url>[^)]+)\)(?<txt2>[^[]+)/g   
                regexToSubstGroups = `$<txt1><img src="$<url>" alt="$<alt>"/>$<txt2>`;
                break;
            // case 'code': 
            //     regexToMatch = /\!\[(.*?)\]\((.*?)\)/g 
            //     regexToHtml=   /(?<txt1>[^[]+)\!\[(?<alt>[^\]]+)\]\((?<url>[^)]+)\)(?<txt2>[^[]+)/g   
            //     regexToSubstGroups = `$<txt1><img src="$<url>" alt="$<alt>"/>$<txt2>`;
            // break;
        }

        if (txt.match(regexToMatch) !== null) { 
            txt = txt.replace(regexToHtml,regexToSubstGroups)
        return makeHtml(txt, type)
    }
    else return txt 
        }
   

       let [pre1str,storeImgs] =   linkPlaceholdReplace(preStr, 'img') 
       let [str,storeLinks] =   linkPlaceholdReplace(pre1str, 'link')  

        str = uniReplace(str,'b')
        str = uniReplace(str,'i')
        str = uniReplace(str,'`')

        // //get back transformed brackets
        str = linkInverseReplace (str,storeImgs, 'img' )
        str = linkInverseReplace (str,storeLinks, 'link')
      
      
         str = makeHtml(str, 'img')
         str = makeHtml(str, 'link')
  
        return str
        } // withBracketsReplace end

       
   inStr = withBracksReplace(inStr)  // actions and replacing with brackets

   inStr = inStr.match(/^####.*$/) ? inStr.replace(/^####/, convert('####')) : inStr
   inStr = inStr.match(/^###.*$/) ? inStr.replace(/^###/, convert('###')) : inStr
   inStr = inStr.match(/^##.*$/) ? inStr.replace(/^##/, convert('##')) : inStr
   inStr = inStr.match(/^#.*$/) ? inStr.replace(/^#/, convert('#')) : inStr
 

return inStr // return of process()
}

const bufferPreTxt = (inStr) => { 
//place for Code Block replace 
    return  breakLines(inStr).map(str => process(str))
}

const handleIn = (e) => {
   
    const inputString = e.target.value
    setPreIn(inputString)

    return 
}

const handleTest = () => {

   const aTest = `z_#c_**[i_g**en](http://g_p**e.ru/8_.j)zd##![google.com](http://goo_**x.com)fg_**h##_id![li_nk](http://ya_**x.ru) 12v_**`

  
    process(aTest)
    return log('process ->', '\n', process(aTest))// process(aTest)
}

useLayoutEffect(()=>{                 //triggering Text Processor and sync editor and ReadyTXT

    if (preIn.length >0) { // to not send empties in state

  
        setEdit(preIn)

        setReadyTXT(bufferPreTxt(preIn))
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


// links
// \[(?<link>.*?)\]\((?<url>.*?)\)


// log ('inStr', inStr)

// log('##zb#czd##fgh##'.match(/^##.*$/) ? 'test match' : 'test not')

//  if (inStr.length > 0) {

//     if (inStr.match(/^##.*$/) === true )  { log('matching ##', inStr.match(/^##/), )

//     log('match')

//     return inStr = inStr.replace(/^##/, convert('##')) 
   

        
//     }

// else if (inStr.match(/^#/) === true) {
//   return inStr =  inStr.replace(/^#/, convert('#')) }//h1

    

//     inStr = inStr.replace(/$/, convertEndStr()); //
//     return inStr
//  }
 
//  else return inStr





//BS-DEL changing flag's dependent tags -- chnging only current tag
//editing from any place inserts flag's dependant tags, calculate tag's flags for the editing place by last tags   

// <b>adasdasd</b>dfsdf<b> 12323123</b> qqqwweeerr
//tt<b>kkkkkooookkooo</b>

// **adasdasd**dfsdf** 12323123** qqqwweeerr
//tt**kkkkkooookkooo**

//lists - level depends of spaces and tabs in the begin of a string



/// GBG ----------------

// const makeHtmlLinks = (txt) => {                // LInk Invert conversion   
//     const regexToHtml=  /(?<txt1>[^[]+)\[(?<link>[^\]]+)\]\((?<url>[^)]+)\)(?<txt2>[^[]+)/g 
//         const regexToMatch = /\[(.*?)\]\((.*?)\)/g //Link
//         let regexToSubstGroups = '$<txt1><a href="$<url>">$<link></a>$<txt2>'

//     if (txt.match(regexToMatch) !== null) {
//             txt = txt.replace(regexToHtml, regexToSubstGroups)
//         return makeHtmlLinks(txt)
//     }
//     else return txt 
// }
// const makeHtmlImg = (txt) => {                // LInk Invert conversion   

//     const regexToHtml=  /(?<txt1>[^[]+)\!\[(?<alt>[^\]]+)\]\((?<url>[^)]+)\)(?<txt2>[^[]+)/g 
//         const regexToMatch = /\!\[(.*?)\]\((.*?)\)/g //Img
//         let  regexToSubstGroups = `$<txt1><img src="$<url>" alt="$<alt>"/>$<txt2>`

//     if (txt.match(regexToMatch) !== null) { 
//             txt = txt.replace(regexToHtml,regexToSubstGroups)
//         return makeHtmlImg(txt)
//     }
//     else return txt 
// }

// const bReplace = (txt) => {
//     // log('b fired')
//     if (txt.match(/\*\*/)) { //(txt.match(/.*\*\*/))
        
//         txt = txt.replace(/\*\*/, convert('**'))
        
//     return bReplace(txt)
//     }
//     else {
//         //log('txt else', txt)
//         return txt}

// }

// const iReplace = (txt) => {
// if (txt.match(/\_/)) { //(txt.match(/.*\*\*/))
        
//     txt = txt.replace(/\_/, convert('_'))
    
// return iReplace(txt)
// }
// else {
//     //log('txt else', txt)
//     return txt}
//   }