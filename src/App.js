import React from 'react';
import Home from './Pages/Home';
import About from './Pages/About';
import Return from './Pages/Return';
import RouteTop from './components/RouteTop';
import {  Route, Routes} from 'react-router-dom'


function App() {
  return (
    <div className='gradient__bg'>
      {/* <Header /> */}
        <RouteTop />
      <Routes>
        <Route path='/aboutus' element={<About/>}></Route>
        <Route path='/sm-auto' element={<Home/>}></Route>
        <Route path='/returns' element={<Return />}></Route>
        </Routes>


    
    </div>
  );
}

export default App;
