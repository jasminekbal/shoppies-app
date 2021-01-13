import './App.css';
import arrow from './res/arrow.svg'
import awardsImg from './res/awardsImg.svg'
import searchArrow from './res/searchArrow.svg'
import {Link} from 'react-scroll'
import {useState} from 'react';

const LOCAL_STORAGE_KEY = 'NOMINATIONS';

function App() {
  let nominationData = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!nominationData) {
    nominationData = []
  }else {
    nominationData = JSON.parse(nominationData)
  }
  
  const [state, setState] = useState({nominations: nominationData, isError: false, searchText: "", previousSearch: "", searchResults:"", movies: []})

  const deleteMovie = (id) => {
    const nominations = state.nominations.filter(movie => {return movie.id !== id})
    setState({...state, nominations: nominations})
  } 

  const getNominations = () => {
    const rows = state.nominations.map((info, index) => {
      const row = (
        <li className="Nomination" key={index}>
          {info.title} ({info.year})
          <span className="DeleteMovie" onClick={e=> deleteMovie(info.id)}>X</span>
        </li>
      )
      return row
    })

    return rows
  }

   async function searchMovie () {
    const title = state.searchText.split(' ').join('+');
    const url = `https://www.omdbapi.com/?s=${title}&type=movie&page=4&apikey=c3847c11`
    const response = await fetch(url)
    const data = await response.json();
    if (data.Response ==="True") {
      const results = data.Search.map( result => {
        const movie = {
          title: result.Title,
          year: result.Year,
          id: result.imdbID,
        }
        return movie
      })
      setState({...state, previousSearch: state.searchText, isError: false, movies: results})
    } else {
      setState({...state, previousSearch: state.searchText, isError: true})
    }
    
  }

  const addMovie = (id) => {
    const movie = state.movies.find(movie => {return movie.id === id})
    state.nominations.push(movie)
    setState({...state, nominations: state.nominations})
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.nominations))
  }

  const getMovies = () => {
    const cards = state.movies.map((movie, index) => {
      const isNominated = state.nominations.find(nomination => nomination.id === movie.id)
      const card = (
          <p key={index} className="MovieInfo">{movie.title} <em>({movie.year})</em>
          <button className="MovieButton" disabled={isNominated} onClick={e=> addMovie(movie.id)}>
              {isNominated ? <s>Nominate</s> : 'Nominate'}
          </button>
          </p>
      )
      return card
    })
    return cards
  }
  const nominationsRows = getNominations()
  const moviesRows = getMovies()

  return (
   <div className="App"> 
    <div className="Landing">
      <h1 className="Title">THE SHOPPIES</h1>
      <div className="Wrapper">
        <h3 className="Subtitle">Nominate your favourite flims for Shopify’s first ever Movie Awards</h3>
      </div>
      
      <div className="Wrapper">
        <img alt="" src={awardsImg}/>
      </div>
      <Link
          to={"nominations"}
          spy={true}
          smooth={true}
          duration={1000}
          offset={-50}>
        <div className="Wrapper">
          <p className="GetStarted">Let's Get Started</p>
        </div>
        <div className="Wrapper">
          <img className="image" alt="" src={arrow}/>
        </div>
      </Link>
    </div>

    <div id="nominations">
      <h3 className="Heading">
        Your Nominations
      </h3>
      {state.nominations.length === 5 && 
        <div className="Wrapper">
          <div className="Alert">
            <p className="AlertText"> Congrats! You've added 5 nominations. </p>
          </div>
        </div>}
      
        <ol className="NominationsWrapper">
          {nominationsRows}
        </ol>
      
    </div>

    <div id="browse">
      <h3 className="Heading">
        Browse Movies
      </h3>
      
      <div className="Wrapper">
          <input type="text" className="SearchBar" placeholder="Enter Title" onChange={e=> setState({...state, searchText: e.target.value})}/>
          <div className="Search" onClick={e=>searchMovie()}><img alt="" className="SearchIcon" src={searchArrow}/></div>
      </div>
      
      <div className="Wrapper">
        <h5 className="SearchTitle">
          {state.movies.length ? `Showing Results for "${state.previousSearch}"` : ''}
        </h5>
      </div>
      
      {state.isError ? <div className="Wrapper"> <p className="Error">Oh no! Something happened, Please try searching a different Title</p> </div> : state.movies.length &&
       <div className="Wrapper">
        <div className="SearchResultsContainer">
          {moviesRows}
        </div>
      </div>}
    </div>
  </div>
  );
}

export default App;
