import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css'
import Carousel from '../components/carousel';
import BrandShowcase from '../components/Brands';
import Products from '../components/Products';
import Service from '../components/Service';
import TrendingProducts from '../components/TrendingProduct';
<<<<<<< HEAD
=======
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import About from '../Pages/About';
import Faqs from '../Pages/Faqs'
>>>>>>> 839682665e3f1953f07aadcd67d80a2420445d19
import ScrollToTop from '../components/ScrollTop';
import Whatsap from '../components/Whatsap';
import FaqList from '../components/FaqList'



function Home() {
  return (
    <div id='home' className='w-100%'>
      {/* <Header /> */}
      
    
      <Navbar />
      <ScrollToTop /> 
      <Carousel />
      <main>
        <Service />
        <BrandShowcase/>
        <TrendingProducts />
        <Products />
        
      </main>
<<<<<<< HEAD
      <Whatsap />
      <FaqList />
=======
      <Faqs />
>>>>>>> 839682665e3f1953f07aadcd67d80a2420445d19
      <Footer />
    
    </div>
  )
}

export default Home
