import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './global/router'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-datepicker/dist/react-datepicker.css";

createRoot(document.getElementById('root')!).render(

    <RouterProvider router={router}/>

)