import React from 'react';
import { Link } from "react-router-dom";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return(
            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    <h1 className="display-4">Jr. CoronAIrus </h1>
                    <p className="lead">Find out the probability of having COVID-19 while diagnosing your patient.</p>
                </div>
                <hr className="my-4" />
                    <div className="container">
                        <Link className="btn btn-primary btn-lg" to="/diagnose">Start!</Link>
                    </div>
            </div>
        );
    }
}

export default Home;
