
import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { toast, ToastContainer,} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import Context from './context';



function App() {
  

  return (
    <>
    
      <Context.Provider value={{

      }}>
        <ToastContainer 
          position='top-center'
        />
        <Header/>
        <main className='min-h-[calc(100vh-120px)] pt-2'>
          <Outlet/>
        </main>
        <Footer/>
        </Context.Provider>
    </>
  )
}

export default App