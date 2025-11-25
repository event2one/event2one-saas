<!DOCTYPE html>
<html>

<head>
  <meta charset='UTF-8'>

  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <!-- <script src="https://unpkg.com/react@latest/umd/react.development.js" crossorigin="anonymous"></script>
  <script src='https://unpkg.com/react-router@5.0.0/umd/react-router.min.js'></script>
  <script src='https://unpkg.com/react-router-dom@5.0.0/umd/react-router-dom.min.js'></script>
  <script src="https://unpkg.com/react-dom@latest/umd/react-dom.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/babel-standalone@6.26.0/babel.min.js"></script> -->

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">


  <!-- React and ReactDOM -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin="anonymous"></script>

  <!-- Babel for JSX transformation -->
  <script src="https://unpkg.com/babel-standalone@6.26.0/babel.min.js" crossorigin="anonymous"></script>

  <!-- React Router -->
  <script src='https://unpkg.com/react-router@5.0.0/umd/react-router.min.js'></script>
  <script src='https://unpkg.com/react-router-dom@5.0.0/umd/react-router-dom.min.js'></script>


  <!-- React Icons -->
  <script src="https://cdn.jsdelivr.net/npm/react-icons@5.3.0/lib/iconContext.min.js"></script>


  <script type="text/babel" src="./components/Vote.js"></script>
  <script type="text/babel" src="./components/Header2.js"></script>
  <script type="text/babel" src="./components/Demo.js"></script>
  <script type="text/babel" src="./components/Nav.js"></script>
  <script type="text/babel" src="./components/Note.js"></script>
  <script type="text/babel" src="./components/ContactInfos.js"></script>
  <script type="text/babel" src="./components/Thanks.js"></script>
  <script type="text/babel" src="./components/SendVote.js"></script>
  <script type="text/babel" src="./components/Section.js"></script>

  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">

  <!-- <link rel="stylesheet" href="//stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">-->


  <!-- <link rel="stylesheet" href="//www.mlg-consulting.com/manager_cc/includes/bootstrap/bootstrap_4.4.1.min.css"> -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="//fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
  <link rel="stylesheet" href="./components/Vote.css">

  <style>
    * {
      font-family: 'Rubik', sans-serif;
    }
  </style>
</head>

<body>
  <div id="root" class=""></div>
</body>

</html>
<script type='text/babel'>


  //reload
//you want reload once after first load
window.onload = function() {
    //considering there aren't any hashes in the urls already
  
        //setting window location
        window.location = window.location;
        //using reload() method to reload web page
        window.location.reload();
 
}

//Réinitialisation des datas
localStorage.removeItem('activeSection');
localStorage.removeItem('notes');

const Link = ReactRouterDOM.Link,
Route = ReactRouterDOM.Route;

const useParams = ReactRouterDOM.useParams;
 
const App = props => (
  <ReactRouterDOM.HashRouter>
          <ul className="border nav mb-2" style={{'display':'none'}}>
            <li className="nav-item" style={{'display':'none'}}><Link className="nav-link" to="/">TO HOME</Link></li>
            <li className="nav-item" style={{'display':'none'}}><Link to="/a">TO A</Link></li>
            <li className="nav-item" style={{'display':'none'}}><Link to="/b">TO B</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/collectifs">Collectifs</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/programmes">Programmes</Link></li>
          </ul>



  <Route exact path="/:langId/:ije/type/:voteType" component={Vote} />
  <Route path="/:langId/:ije/c/:idContact/type/:voteType" exact component={Vote} />
  <Route path="/:langId/:ije/c/:idContact/" exact component={Vote} />
  <Route exact path="/:langId/:ije/vote/:isActive" component={Vote} />
  <Route path="/:langId/:ije/:idContact" exact component={Vote} />
  <Route exact path="/:langId/:ije" component={Vote} />
 </ReactRouterDOM.HashRouter>
      )

      const Home = props => <h1>HOME</h1>
      const A = props => <h1>A</h1>
      const B = props => <h1>B</h1>
      ReactDOM.render(<App />, document.querySelector('#root'));
    </script>