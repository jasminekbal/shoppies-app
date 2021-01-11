import './App.css';
import arrow from './res/arrow.svg'
import {Link} from 'react-scroll'
import {useState} from 'react';


function App() {
  const [state, setState] = useState({nominations: [], isError: false, searchText: "", searchResults:"", movies: []})

  const deleteMovie = (id) => {
    const nominations = state.nominations.filter(movie => {return movie.id !== id})
    setState({...state, nominations: nominations})
    console.log(state.nominations)
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
    console.log(data)
    if (data.Response ==="True") {
      const results = data.Search.map( result => {
        const movie = {
          title: result.Title,
          year: result.Year,
          id: result.imdbID,
        }
        return movie
      })
      console.log(results)
      setState({...state, isError: false, movies: results})
    } else {
      console.log("here")
      setState({...state, isError: true})
    }
    
  }

  const addMovie = (id) => {
    const movie = state.movies.find(movie => {return movie.id === id})
    console.log(state.nominations)

    state.nominations.push(movie)
    setState({...state, nominations: state.nominations})
  }

  const getMovies = () => {
    console.log(state.movies)
    const cards = state.movies.map((movie, index) => {
      const isNominated = state.nominations.find(nomination => nomination.id === movie.id)
      const card = (
        <div className="SearchResult" key={index}>
          <h4 className="MovieTitle">{movie.title}</h4>
          <h4 className="MovieYear"><em>({movie.year})</em></h4>
          <div className="Wrapper">
            <button className="MovieButton" disabled={isNominated} onClick={e=> addMovie(movie.id)}>
              Nominate
            </button>
          </div>
        </div>
      )
      return card
    })

    return cards
  }
  const nominationsRows = getNominations()
  const moviesRows = getMovies()

  console.log(state)

  return (
   <div className="App"> 
    <div className="Landing">
      <h1 className="Title">THE SHOPPIES</h1>
      <h3 className="Subtitle">Nominate your favourite flims for Shopify’s first ever Movie Awards</h3>
      <div className="GetStartedRow">
        <Link
          to={"nominations"}
          spy={true}
          smooth={true}
          duration={1000}
          offset={-50}>
          <div className="GetStartedWrapper">
            <div className="GetStartedRow">
            <p className="GetStarted">Let's Get Started</p>
            </div>
            <div>
            <div className="GetStartedRow">
              <img className="image" alt="" src={arrow}/>
              </div>
            </div>
          </div>
        </Link> 
      </div>
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
        </div>
      }
      
        <ol>
          {nominationsRows}
        </ol>
      
    </div>

    <div id="browse">
      <h3 className="Heading">
        Browse Movies
      </h3>
      
      <div className="Wrapper">
          <input type="text" className="SearchBar" placeholder="Enter Title" onChange={e=> setState({...state, searchText: e.target.value})}/>
          <div className="Search" onClick={e=>searchMovie()}></div>
      </div>

      <h5 className="SearchTitle">
        {state.movies.length ? `Showing Results for "${state.searchText}"` : 'Search Results will Appear Below'}
      </h5>
      

      {state.isError ? <div className="Wrapper"> <p className="Error">Oh no! Something happened, try searching a different title</p> </div> :
       <div className="GridContainer">
         
        {moviesRows}
      </div>}
    </div>
  </div>
  );
}

export default App;
