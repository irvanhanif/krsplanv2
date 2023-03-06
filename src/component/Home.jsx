import React from 'react';
import {Link} from "react-router-dom";
import "./Home.css"

function Home() {
  return (
    <div className='home'>
        <div className="btnToNextPage">
            <Link to={'/data'} className='button'>
                <span>Plan Your KRS</span>
            </Link>
        </div>
        <div className="element">
            <svg width='100%' preserveAspectRatio='none' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="#FD841F" d="M0,64L30,90.7C60,117,120,171,180,202.7C240,235,300,245,360,224C420,203,480,149,540,112C600,75,660,53,720,42.7C780,32,840,32,900,48C960,64,1020,96,1080,90.7C1140,85,1200,43,1260,42.7C1320,43,1380,85,1410,106.7L1440,128L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"></path>
            </svg>
        </div>
    </div>
  )
}

export default Home