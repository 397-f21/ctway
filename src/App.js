const Header = () => {
    return(
        <h1>CTWay</h1>
    )
}

const Card = () => {
    return(
        <div className="card">
            <div className="card-body">
                <div className="card-title">Brynmar</div>
                <div className="card-text">Red Line</div>
            </div>
        </div>
    )
}

function App() {
  return (
    <div>
        <Header/>
        <Card/>
        <Card/>
        <Card/>
        <Card/>
        <Card/>
        <Card/>
    </div>
  );
}

export default App;
