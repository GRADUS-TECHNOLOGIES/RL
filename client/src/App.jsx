import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

//* IMPORT DE PAGINAS
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Projects from './pages/Projects.jsx'
import Purpose from './pages/Purpose.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import UnderConstructionPage from './pages/UnderConstructionPage.jsx'

//* IMPORT DE COMPONENTES
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute.jsx'
import CreatePost from './pages/CreatePost.jsx'
import UpdatePost from './pages/UpdatePost.jsx'
import PostPage from './pages/PostPage.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Search from './pages/Search.jsx'
import UnderConstructionPage2 from './pages/UnderConstPage.jsx'

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<UnderConstructionPage2 />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<OnlyAdminPrivateRoute />}>
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:postId" element={<UpdatePost />} />
        </Route>
        <Route path="/services" element={<Projects />} />
        <Route path="/post/:postSlug" element={<PostPage />} />
        <Route path="/purpose" element={<Purpose />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/construccion" element={<UnderConstructionPage />} />
      </Routes>
      <Footer />
    </Router>
  )
}