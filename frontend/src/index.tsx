// Import core React libraries and application styles
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

// Import routing and authentication providers
// BrowserRouter provides the routing context required by react-router
// AuthProvider supplies authentication state and methods to the app
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Create root and render app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    {/*
      BrowserRouter establishes the router context so that components like <Routes>
      and hooks such as useRoutes/useNavigate can access routing information.
      Without this wrapper, react-router throws "useRoutes() may be used only in the context of a <Router>".
    */}
    <BrowserRouter>
      {/*
        AuthProvider makes authentication state (user, login/logout actions) available
        throughout the component tree. Components using useAuth must be nested inside this provider.
      */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
