import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './global/router'


createRoot(document.getElementById('root')!).render(

    <RouterProvider router={router}/>

)