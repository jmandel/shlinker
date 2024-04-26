import './app.css'
import * as shlink from './index'

export function App() {

  const shlRef = async function(domElt: any) {
    console.log("dom elt", domElt)
    if (!domElt) return;
    const shlP = await shlink.parse();
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
