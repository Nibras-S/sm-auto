import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css'
import Carousel from '../components/carousel';
import BrandShowcase from '../components/Brands';
import Products from '../components/Products';
import Service from '../components/Service';
import TrendingProducts from '../components/TrendingProduct';
import ScrollToTop from '../components/ScrollTop';
import Whatsap from '../components/Whatsap';
import FaqList from '../components/FaqList'

function Home() {
  return (
    <div id='home' className='w-100%'>
        
      <Navbar />
      <ScrollToTop /> 
      <Carousel />
      <main>
        <Service />
        <BrandShowcase/>
        <TrendingProducts />
        <Products />        
      </main>
      <Whatsap />
      <FaqList />
      <Footer />    
    </div>
  )
}

export default Home

