import './App.css';
import arrow from './res/arrow.svg';
import awardsImg from './res/awardsImg.svg';
import searchArrow from './res/searchArrow.svg';
import {Link} from 'react-scroll';
import {useState} from 'react';
import infoImg from './res/info.svg';


const LOCAL_STORAGE_KEY = 'NOMINATIONS';


function App() {
  let nominationData = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!nominationData) {
    nominationData = []
  } else {
    nominationData = JSON.parse(nominationData)
  }
  
  const [state, setState] = useState({nominations: nominationData,
    isError: false, searchText: "", previousSearch: "",
    showMovieInfo: false, movieInfo: null, movieId: null,
    deleteHover: false, deleteId: null,
    searchResults:"", movies: []})

  const deleteMovie = (id) => {
    const nominations = state.nominations.filter(movie => {return movie.id !== id})
    setState({...state, nominations: nominations})
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nominations))
  } 

  const getNominations = () => {
    const rows = state.nominations.map((info, index) => {
      const row = (
        <li className="Nomination" key={index}>
          {state.deleteHover && state.deleteId === info.id ? <s>{info.title} ({info.year})</s> : `${info.title} (${info.year})`}
          
          <span className="DeleteMovie" onMouseEnter={e=> setState({...state, deleteHover: true, deleteId: info.id})}
            onMouseLeave={e=> setState({...state, deleteHover: false})}
            onClick={e=> deleteMovie(info.id)}>X</span>
        </li>
      )
      return row
    })
    return rows
  }

   async function searchMovie () {
    const title = state.searchText.split(' ').join('+');
    const url = `https://www.omdbapi.com/?s=${title}&type=movie&page=1&apikey=c3847c11`
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

  async function launchInfo (movieTitle, id) {
    if (state.showMovieInfo && id === state.movieId) {
      setState({...state, showMovieInfo: false})
      return
    }

    const title = movieTitle.split(' ').join('+');
    const url = `https://www.omdbapi.com/?t=${title}&type=movie&plot=full&apikey=c3847c11`
    const response = await fetch(url)
    const data = await response.json();
    if (data.Response ==="True") {
      setState({...state, showMovieInfo: true, movieId: data.imdbID, 
                movieInfo: {plot: data.Plot, actors: data.Actors, rating: data.imdbRating}})
    }
  }
  

  const getMovies = () => {
    const cards = state.movies.map((movie, index) => {
      const isNominated = state.nominations.find(nomination => nomination.id === movie.id)

      const card = (
        <div key={index}>
          <p className="MovieInfo">{movie.title} <em>({movie.year}) </em>
          <img onClick={e=> launchInfo(movie.title, movie.id)} src={infoImg} alt=""/>
          <button className="MovieButton" disabled={isNominated} onClick={e=> addMovie(movie.id)}>
              {isNominated ? <s>Nominate</s> : 'Nominate'}
          </button> 
          </p>
          {state.showMovieInfo && state.movieId === movie.id &&
             <div> 
               <div className="MovieDescription"><strong>Plot:</strong> {state.movieInfo.plot}</div>
               <div className="MovieDescription"><strong>Actors:</strong> {state.movieInfo.actors}</div>
               <div className="MovieDescription"><strong>Rating:</strong> {state.movieInfo.rating}</div>
            </div>}
        </div>
      )
      return card
    })
    return cards
  }

  const nominationsRows = getNominations()
  const moviesRows = getMovies()

  return (
   <div className="App"> 
    <div className="Wrapper">
          <a className="GithubLink" target="_blank" href="https://github.com/jasminekbal/shoppies-app">&lt;Link to Github&gt;</a>
    </div>
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
      
        {state.nominations.length ? 
        <ol className="NominationsWrapper">
           {nominationsRows}
        </ol> :
        <div className="NoNominationsText"> 
          Oh no, looks like you haven't nominated any movies yet. You can browse and nominate your favourites below!
        </div>}
    </div>

    <div id="browse">
      <h3 className="Heading">
        Browse Movies
      </h3>
      
      <div className="Wrapper">
          <input type="text" className="SearchBar" placeholder="Enter Title" onChange={e=> setState({...state, searchText: e.target.value})}/>
          <div className="SearchButton" onClick={e=>searchMovie()}><img alt="" className="SearchIcon" src={searchArrow}/></div>
      </div>
      
      <div className="Wrapper">
        <h5 className="SearchTitle">
          {state.movies.length ? `Showing Results for "${state.previousSearch}"` : ''}
        </h5>
      </div>
      
      {state.isError ? <div className="Wrapper"> <p className="Error">Whoops something went wrong. Please try searching a different title</p> </div> : state.movies.length &&
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
