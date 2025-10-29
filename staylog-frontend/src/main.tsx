import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './global/router'
import store from './global/store'
import { Provider } from 'react-redux'


createRoot(document.getElementById('root')!).render(

    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>

)