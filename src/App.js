import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {CookiesProvider} from 'react-cookie';
import Home from './component/Home';
import Input from './component/Input';
import Table from './component/Table';
import "@fontsource/poppins";

function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/data' element={<Input/>} />
          <Route path='/tabel' element={<Table/>} />
        </Routes>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
