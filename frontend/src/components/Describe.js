import React from 'react';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Container } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';

export class Describe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            colsValues: new Array(this.cols().length).fill(null)
        };
    }

    cols() {
        return([ {name: 'persons_home', type: 'int' , question : "How many persons live at household?" },
        { name: 'sympt_epi', type: 'bool', question : "Anyone at home with COVID-19 symptoms?" },
        { name: 'home_confirmed', type: 'bool', question : "Anyone at home with COVID-19 confirmed?" },
        { name: 'school_symptoms', type: 'bool', question : "Anyone at school with COVID-19 symptoms?" },
        { name: 'school_confirmed', type: 'bool', question : "Anyone at school with COVID-19 confirmed?" },
        { name: 'fever', type: 'bool', question : "Does the patient have fever?" },
        { name: 'highest_fever', type: 'int', question : "Which has been the highest fever detected?" },
        { name: 'tos', type: 'bool', question : "Does the patient present a cough?" },
        { name: 'crup', type: 'bool', question : "Does the patient present crup?" },
        { name: 'dysphonia', type: 'bool', question : "Does the patient present dysphonia?" },
        { name: 'resp', type: 'bool', question : "Does the patient present dyspnea?", neutral: 0.5 },
        { name: 'wheezing', type: 'bool', question : "Does the patient present wheezing?" },
      { name: 'nasal_congestion', type: 'bool', question : "Does the patient present nasal congestion?" },
        { name: 'fatiga', type: 'bool', question : "Does the patient present fatiga?" },
        { name: 'crackles', type: 'bool', question : "Does the patient present crackles?" },
        { name: 'headache', type: 'bool', question : "Does the patient present headache?" },
        { name: 'vomiting', type: 'bool', question : "Does the patient present vomiting?" },
        { name: 'dyarrea', type: 'bool', question : "Does the patient present diarrhea?" },
        { name: 'ausc_resp', type: 'bool', question : "Does the patient have a pathological respiratory auscultation?" },
        { name: 'odynophagia', type: 'bool', question : "Does the patient present odynophagia?" },
        { name: 'taste_smell', type: 'bool', question : "Does the patient present taste or smell alteration?" },
        { name: 'smokers_home', type: 'bool', question : "Does someone smoke at the patient's home?" },
        { name: 'sex', type: 'sex', question : "Patient's sex:" },
        { name: 'rooms', type: 'int', question : "How many rooms does the house of the patient have?" },
        { name: 'sports', type: 'bool', question : "Does the patient practice any sport?" },
        { name: 'bus', type: 'bool', question : "Does the patient take the schoolbus?" },
        { name: 'm2', type: 'int', question : "How many m2 does the house of the patient have?" }]);
    }

    handleChange(e, i) {
        let val = e.target.value;
        let colsValues = [...this.state.colsValues];
        colsValues[i] = val;
        this.setState({colsValues});
    }

    createForm() {
        let cols = this.cols();
        var input = [];
        for (let i=0; i < cols.length; i++) {
            var aux;
            if(cols[i].type == "bool"){
                aux = (<select className='form-control' id={cols[i].name} onChange={(e) => {this.handleChange(e, i)}} type='text' >
                <option disabled selected>Choose.. </option>
                <option value="0">No </option>
                <option value="1">Yes</option>
                <option value="2">Unknown</option>
                </select>);
            }
            else if(cols[i].type == "sex"){
                aux = (<select className='form-control' id={cols[i].name} onChange={(e) => {this.handleChange(e, i)}} type='text' >
                <option disabled selected>Choose.. </option>
                <option value="0">Male</option>
                <option value="1">Female</option>
                <option value="2">Not specified</option>
                </select>);

            }
            else {
                aux = (<input className='form-control' id={cols[i].name} onChange={(e) => {this.handleChange(e, i)}} type='number' />);
            }

            input.push(
            <div className='col-6'>
                <div className='form-group'>
                    <label>
                        {cols[i].question}
                    </label>
                    {aux}
                </div>
            </div>
            );
        }
        return input;
    }

    matchesString(item, value) {
        if(value === null)
            value = "";

        return (
            this.state.selectedItems.map(x => x.id).indexOf(parseInt(item.id)) === -1 && (
            item.term.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
            value.toLowerCase().indexOf(item.term.toLowerCase()) !== -1)
        )
    }

    handleSubmit(event) {
        const model = tf.loadGraphModel(process.env.PUBLIC_URL + "/models/web_model/model.json");
        let colsValues = this.state.colsValues;
        let cols = this.cols();
        let tensorValues = [];

        for (let i = 0; i < cols.length; i++) {
            if (cols[i].type == "bool" || cols[i].type == "sex") {
                // Neutral value is 2 except if there is a "neutral" property
                if (colsValues[i] === null)
                    tensorValues.push(cols[i].neutral || 2.0);
                else
                    tensorValues.push(parseFloat(colsValues[i]));
            } else {
                if (colsValues[i] === "" || colsValues[i] === null)
                    tensorValues.push(-1.0);
                else {
                    if (cols[i].name == "highest_fever") {
                        let aux = parseFloat(colsValues[i]);
                        if      (aux > 37.5 && aux < 38) tensorValues.push(1.0);
                        else if (aux > 38 && aux < 39) tensorValues.push(2.0);
                        else if (aux > 39) tensorValues.push(3.0);
                        else tensorValues.push(-1.0);
                    }
                    else
                        tensorValues.push(parseFloat(colsValues[i]));
                }
            }
        }

        model.then(x => {
            var input = tf.tensor2d([tensorValues]);
            alert(x.predict(input));
        });
        
        event.preventDefault();
    }

    render() {
        return (
            <>
                <Container>
                    <form>
                        <div className="row pt-4">
                            {this.createForm()}
                        </div>
                        <div className="row pb-4">
                            <div className="col">
                                <button type="button" className="btn btn-dark btn-block" onClick={(e) => this.handleSubmit(e)}>Submit</button>
                            </div>
                        </div>
                    </form>
                </Container>
            </>
        );
    }
}
