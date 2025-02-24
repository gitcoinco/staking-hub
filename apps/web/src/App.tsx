import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Add your routes here */}
        <Route path="/" element={<div>Home Page</div>} />
      </Route>
    </Routes>
  )
}

export default App 