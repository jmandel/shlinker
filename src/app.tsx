import './app.css'
import * as shlink from './index'

export function App() {

  const shlRef = async function(domElt: any) {
    console.log("dom elt", domElt)
    if (!domElt) return;
    const shlP = await shlink.parse("https://joshuamandel.com/cgm/#shlink:/eyJ1cmwiOiJodHRwczovL2pvc2h1YW1hbmRlbC5jb20vY2dtL3NobC8xMjBkYXlfYWdwX2J1bmRsZV91bmd1ZXNzYWJsZV9zaGxfaWQwMDAwMDAwIiwiZmxhZyI6IkxVIiwia2V5IjoiYWdwX29ic191bmd1ZXNzYWJsZV9yYW5kb21fa2V5MDAwMDAwMDAwMDAwMCIsImxhYmVsIjoiSm9zaCdzIENHTSBEYXRhIn0");
    const shlR = await shlink.retrieve(shlP)
    await shlink.render(shlR, domElt, { showButtons: ["copy", "download"], showDetails: true, logoBottom: "https://waverify.doh.wa.gov/imgs/waverifylogo.png"})
  }


  return (
    <>
    <h1>SHLink Widget Demo</h1>
      <div style={{padding: "1em", border: "1px dashed #646cff", display: "inline-block"}} ref={shlRef}></div>
    </>
  )
}
