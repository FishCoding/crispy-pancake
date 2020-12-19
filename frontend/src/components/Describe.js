import React from 'react';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faTrash } from '@fortawesome/free-solid-svg-icons';


export class Describe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            selectedItems: [],
        };
    }
    createForm() {
        var cols = ['persons_home', 'sympt_epi', 'home_confirmed',
        'school_symptoms', 'school_confirmed', 'fever',
        'highest_fever', 'tos', 'crup', 'dysphonia', 'resp', 'wheezing', 'nasal_congestion', 'fatiga', 'crackles',
              'headache', 'vomiting', 'dyarrea', 'ausc_resp', 'odynophagia', 'taste_smell'];

        var input = [];
        for ( let i=0; i < cols.length; i++) {
            input.push(
        <div className="form-group">
            <label>
                {cols[i]}
            </label>
            <input className="form-control" id={cols[i]} type="text" value="" placeholder={"Enter:" + cols[i]}  />

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

    render() {
        return (
            <>
                <div className="container" style="margin-top:5px">
                        <form onSubmit={this.handleSubmit}>
                            {this.createForm()}
                        </form>
                </div>
            </>
        );
    }
}
