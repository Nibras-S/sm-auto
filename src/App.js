import React from 'react';
import Home from './Pages/Home';
import About from './Pages/About';
import Return from './Pages/Return';
import RouteTop from './components/RouteTop';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className='gradient__bg'>
      {/* <Header /> */}
      <RouteTop />
      <Routes>
<<<<<<< HEAD
        <Route path='/aboutus' element={<About />} />
        <Route path='/' element={<Home />} />
        <Route path='/returns' element={<Return />} />
      </Routes>
=======
        <Route path='/aboutus' element={<About/>}></Route>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/returns' element={<Return />}></Route>
        </Routes>


    
>>>>>>> d4143bd21938c599e99e4b4865349ab76ed82cfd
    </div>
  );
}

export default App;
