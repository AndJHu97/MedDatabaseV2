import axios from 'axios';
import React from 'react';
class App extends React.Component {
  state = {details: [], }

  componentDidMount(){
    let data;
    axios.get('http://127.0.0.1:8000/api/1/')
    .then(res => {
      data = res.data;
      console.log("res.data",res.data);
      this.setState({
        details: data
      });
    })
    .catch(err =>{console.error('Error:', err); // Log any errors})
  });
}

  render(){
    return(
      <div>
        <header>Testing React</header>
        <hr></hr>
        {this.state.details.map((output, id) => (
          <div key = {id}>
            <h2>{output.Name}</h2>
            <h3>{output.DiseaseName}</h3>
            </div>
        ))}
      </div>
    )
  }

}

export default App;
