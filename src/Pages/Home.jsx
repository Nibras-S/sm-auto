import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css'
import Carousel from '../components/carousel';
import BrandShowcase from '../components/Brands';
import Products from '../components/Products';
import Service from '../components/Service';
import TrendingProducts from '../components/TrendingProduct';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import About from '../Pages/About';
import ScrollToTop from '../components/ScrollTop';


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
      <Footer />
    
    </div>
  )
}

export default Home
