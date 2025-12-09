import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './global/router'
import "bootstrap/dist/css/bootstrap.min.css";
import 'react-quill-new/dist/quill.snow.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-datepicker/dist/react-datepicker.css";
import store from './global/store'
import { Provider } from 'react-redux'
import './index.css'

createRoot(document.getElementById('root')!).render(

    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>

)