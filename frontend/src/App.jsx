import React from 'react'
import AppRoutes from './routes/Approutes'
import { UserProvider } from './context/user.context'

const App = () => {
  return (
    <div>
      <UserProvider>
      <AppRoutes />
      </UserProvider>
    </div>
  )
}

export default App

