import React from 'react'


export default function List(props) {
    return (
        <div className={"accordion-item"}>
            <h2 className={"accordion-header"} id={props.random}>
                <button className={"accordion-button"} type="button" data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true"
                    aria-controls="panelsStayOpen-collapseOne">
                    {props.title}
                </button>
            </h2>
            <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show"
                aria-labelledby={props.random}>
                <div className={"accordion-body"}>
                    {props.description}
                </div>
                <button className={"btn btn-primary"} style={{marginLeft : '10px', marginTop : '10px', marginBottom : '10px'}}>Entrar na tarefa</button>
                <button className={"btn btn-primary"} style={{marginLeft : '10px', marginTop : '10px', marginBottom : '10px'}}>Finalizar projeto</button>
            </div>
        </div>
    )
}