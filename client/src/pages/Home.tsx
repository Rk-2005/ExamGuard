import React from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Howitwork from '../components/HowItWorks'
import KeyFeature from '../components/KeyFeature'
import About from '../components/About'

function Home() {
  return (
    <div className='bg-white'>
    <Navbar></Navbar>
    <Banner></Banner>
    <About></About>
    <Howitwork></Howitwork>
    <KeyFeature></KeyFeature>
    </div>
  )
}

export default Home