import React from 'react'
import pageNotFoundImage from "../imgs/404.png"
import { Link } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <section className='h-cover relative p-10 flex flex-col items-center gap-20 text-center'>

        <img src={pageNotFoundImage} className='select-none border-2 border-grey w-72 aspect-square object-cover rounded'/>

        <h1 className='text-4xl leading-7'>Page Not Found</h1>
       <p className='text-dark-grey text-xl leading-7 -mt-8'>The page you are looking for does not exist. Head back to the <Link  to="/" className='text-black underline'>
       home page</Link></p>
       <div className='mt-auto'>
        
       </div>
    </section>
  )
}

export default PageNotFound