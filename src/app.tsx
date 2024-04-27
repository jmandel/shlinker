import './app.css'
import * as shlink from './index'

export function App() {

  const shlRef = async function(domElt: any) {
    console.log("dom elt", domElt)
    if (!domElt) return;
    const shlP = await shlink.parse("https://joshuamandel.com/cgm/#shlink:/eyJ1cmwiOiJodHRwczovL2pvc2h1YW1hbmRlbC5jb20vY2dtL3NobC8xMjBkYXlfYWdwX2J1bmRsZV91bmd1ZXNzYWJsZV9zaGxfaWQwMDAwMDAwIiwiZmxhZyI6IkxVIiwia2V5IjoiYWdwX29ic191bmd1ZXNzYWJsZV9yYW5kb21fa2V5MDAwMDAwMDAwMDAwMCIsImxhYmVsIjoiSm9zaCdzIENHTSBEYXRhIn0");
    const shlR = await shlink.retrieve(shlP)
    await shlink.render(shlR, domElt, { showDetails: true})
  }

  return (
    <>
    <h1>SHLink Widget Demo</h1>
      <div ref={shlRef}></div>
    </>
  )
}
