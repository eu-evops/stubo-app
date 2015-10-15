import React from 'react'
import ReactDOM from 'react-dom'
import cookie from 'react-cookie'
import Griddle from 'griddle-react'
import { Button, Tooltip, OverlayTrigger, Grid, Row, Col, Modal, Input, ButtonInput, Alert } from 'react-bootstrap'


function ExecuteRequest(href, body) {
    var infoModal = $('#myModal');

    $.ajax({
        type: "POST",
        dataType: "json",
        url: href,
        data: JSON.stringify(body),
        success: function (data) {
            var info_msg = JSON.stringify(data.data, null, 2);
            var htmlData = '<ul><li>Message: ' + info_msg + '</li></ul>';
            infoModal.find('.modal-body').html(htmlData);
            infoModal.modal('show');
            return false;
        }
    }).fail(function ($xhr) {
        var data = $xhr.responseJSON;
        var htmlData = '<ul><li>Error: ' + data.error.message + '</li></ul>';
        infoModal.find('.modal-body').html(htmlData);
        infoModal.modal('show');
        return false;
    });
}

// we are getting session data nested in the array, so we bring it forward
function reformatJSON(initialData) {

    var newScenariosList = [];
    for (var key in initialData) {
        if (initialData.hasOwnProperty(key)) {
            // console.log(key + " -> " + initialData[key].name);
            var singleObj = {};
            singleObj['name'] = initialData[key].name;
            singleObj['ref'] = initialData[key].scenarioRef;
            singleObj['space_used_kb'] = initialData[key].space_used_kb;
            singleObj['stub_count'] = initialData[key].stub_count;
            singleObj['recorded'] = initialData[key].recorded;
            // creating children array

            var sessions = [];

            initialData[key].sessions.forEach(function (entry, index) {
                // adding session information to parent object
                if (index == 0) {
                    singleObj['session'] = entry.name;
                    singleObj['status'] = entry.status;
                    singleObj['loaded'] = entry.loaded;
                    singleObj['last_used'] = entry.last_used;

                } else {
                    var childrenObj = {};
                    childrenObj['name'] = initialData[key].name;
                    childrenObj['session'] = entry.name;
                    childrenObj['status'] = entry.status;
                    childrenObj['loaded'] = entry.loaded;
                    childrenObj['last_used'] = entry.last_used;
                    childrenObj['ref'] = initialData[key].scenarioRef;
                    childrenObj['space_used_kb'] = initialData[key].space_used_kb;
                    childrenObj['stub_count'] = initialData[key].stub_count;
                    childrenObj['recorded'] = initialData[key].recorded;
                    // adding object to children array
                    sessions.push(childrenObj)
                }
            });
            singleObj['sessions'] = sessions;

            newScenariosList.push(singleObj);
        }
    }
    return newScenariosList
}

var LinkComponent = React.createClass({
    displayName: "LinkComponent",

    render: function () {
        var url = "/manage/scenarios/details?scenario=" + this.props.rowData.ref;
        return <a href={url}><span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}> {this.props.data}</span></a>

    }
});

var ExportButton = React.createClass({
    displayName: "ExportButton",
    render: function () {
        const tooltip = (
            <Tooltip>Export scenario.</Tooltip>
        );

        var url = '/manage/scenarios/export?scenario=' + this.props.data.ref;

        return (
            <OverlayTrigger placement='left' overlay={tooltip}>
                <a href={url} className="btn btn-sm btn-info">
                            <span
                                className="glyphicon glyphicon-cloud-download"></span>
                </a>
            </OverlayTrigger>
        );
    }
});

// end session button
var EndSessionsButton = React.createClass({
    displayName: "EndSessionsButton",

    getInitialState: function () {
        return {
            ref: this.props.data.ref,
            status: false
        };
    },
    handleClick: function (event) {
        this.setState({status: !this.state.status});

        var href = this.state.ref + "/action";

        var body = {
            end: 'sessions'
        };
        ExecuteRequest(href, body);

    },
    render: function () {


        const EndSessionsTooltip = (
            <Tooltip>End all active sessions for this scenario.</Tooltip>
        );
        // checking whether scenario has a session and whether it is dormant or not
        if (this.props.data.session != null && this.props.data.status != 'dormant') {
            return (
                <OverlayTrigger placement='left' overlay={EndSessionsTooltip}>

                    <Button onClick={this.handleClick} bsStyle='warning' bsSize='small'>
                        <span className="glyphicon glyphicon-stop"></span>
                    </Button>
                </OverlayTrigger>
            );
        }
        // session status is either dormant or there are no sessions, disabling button
        else {
            return (
                <Button onClick={this.handleClick} bsStyle='warning' bsSize='small' disabled>
                    <span className="glyphicon glyphicon-stop"></span>
                </Button>

            );
        }
    }
});

// remove scenario action button
var RemoveButton = React.createClass({
    displayName: "RemoveButton",

    getInitialState: function () {
        // getting scenario ref
        return {
            ref: this.props.data.ref,
            name: this.props.data.name
        };
    },
    handleClick: function (event) {

        var infoModal = $('#myModal');
        var scenarioName = this.state.name;

        $.ajax({
            type: "DELETE",
            url: this.state.ref,
            success: function () {
                var htmlData = '<ul><li> Scenario (' + scenarioName + ') removed successfuly. </li></ul>';
                infoModal.find('.modal-body').html(htmlData);
                infoModal.modal('show');
                return false;
            }
        }).fail(function ($xhr) {
            var response = $xhr;
            var htmlData = '<ul><li> Status code: ' + response.status + '. Error: ' + response.responseText + '</li></ul>';
            infoModal.find('.modal-body').html(htmlData);
            infoModal.modal('show');
            return false;
        });

    },
    render: function () {
        const RemoveTooltip = (
            <Tooltip>Remove scenario.</Tooltip>
        );
        return (
            <OverlayTrigger placement='left' overlay={RemoveTooltip}>
                <Button onClick={this.handleClick} bsStyle='danger' bsSize='small'>
                    <span className="glyphicon glyphicon-remove-sign"></span>
                </Button>
            </OverlayTrigger>
        );
    }
});

var ActionComponent = React.createClass({
    displayName: "ActionComponent",

    render: function () {
        // rendering action buttons
        return (<div className="btn-group">
                <ExportButton data={this.props.rowData}/>
                <RemoveButton data={this.props.rowData}/>
                <EndSessionsButton data={this.props.rowData}/>
            </div>
        )
    }
});

var StatusLabelComponent = React.createClass({
    displayName: "StatusLabelComponent",

    getInitialState: function () {
        // getting scenario name and hostname
        return {
            labelClass: 'label label-default'
        };
    },

    componentDidMount: function () {

    },

    render: function () {
        switch (this.props.rowData.status) {
            case undefined:
                this.state.labelClass = '';
                break;
            case 'dormant':
                break;
            case 'playback':
                this.state.labelClass = 'label label-success';
                break;
            case 'record':
                this.state.labelClass = 'label label-warning';
                break;
        }

        var sessionStatusTooltip = (
            <Tooltip>Current session mode is {this.props.rowData.status}. Check out documentation for more
                information.</Tooltip>
        );

        // checking whether row has children object, removing children objects from children because they cause
        // to create a whole separate grid inside a row
        if (this.props.rowData.sessions != undefined) {
            var sessions = this.props.rowData.sessions.length;
            if (sessions > 1) {
                // adding session count number to the label
                var sessionCounterTooltip = (
                    <Tooltip>There are {sessions} sessions in this scenario. Access scenario details to get
                        more information.</Tooltip>
                );
                return (

                    <div>
                        <OverlayTrigger placement='left' overlay={sessionStatusTooltip}>
                            <span className={this.state.labelClass}> {this.props.rowData.status}</span>
                        </OverlayTrigger>
                        &nbsp;
                        <OverlayTrigger placement='left' overlay={sessionCounterTooltip}>
                            <span className="label label-primary">{sessions}</span>
                        </OverlayTrigger>
                    </div>

                )

            } else {
                // standard row output for each scenario
                return ( <OverlayTrigger placement='left' overlay={sessionStatusTooltip}>
                        <span className={this.state.labelClass}> {this.props.rowData.status}</span>
                    </OverlayTrigger>
                )
            }
        } else {
            // children session status label
            return (<OverlayTrigger placement='left' overlay={sessionStatusTooltip}>
                <span className={this.state.labelClass}> {this.props.rowData.status}</span>
            </OverlayTrigger>)
        }


    }
});

var columnMeta = [
    {
        "columnName": "name",
        "displayName": "Scenario",
        "order": 1,
        "locked": false,
        "visible": true,
        "customComponent": LinkComponent
    },
    {
        "columnName": "actions",
        "displayName": "Actions",
        "locked": false,
        "visible": true,
        "customComponent": ActionComponent
    },
    {
        "columnName": "status",
        "displayName": "Status",
        "locked": false,
        "visible": true,
        "customComponent": StatusLabelComponent
    }

];

function updateTable(component) {

    var href = '';
    if (cookie.load('stubo.all-hosts') || false) {
        // amending query argument to get all hosts
        href = '/stubo/api/v2/scenarios/detail?all-hosts=true'
    } else {
        href = '/stubo/api/v2/scenarios/detail?all-hosts=false'
    }

    $.get(href, function (result) {
        var newList = reformatJSON(result.data);
        if (component.isMounted()) {
            component.setState({
                results: newList
            });
        }
    });
}

var ExternalScenarios = React.createClass({
    displayName: "ExternalScenarios",
    getInitialState: function () {
        var initial = {
            "results": [],
            "resultsPerPage": 50
        };

        return initial;
    },
    //general lifecycle methods
    componentWillMount: function () {
    },
    componentDidMount: function () {
        // getting scenarios
        updateTable(this);

        // subscribing to modal close event
        $('#myModal').on('hidden.bs.modal', function () {
            updateTable(this);
        }.bind(this));
    },

    //what page is currently viewed
    setPage: function (index) {
    },
    //this will handle how the data is sorted
    sortData: function (sort, sortAscending, data) {
    },
    //this changes whether data is sorted in ascending or descending order
    changeSort: function (sort, sortAscending) {
    },
    //this method handles the filtering of the data
    setFilter: function (filter) {
    },
    //this method handles determining the page size
    setPageSize: function (size) {
    },


    render: function () {
        const gridInstance = (
            <Grid fluid={true}>
                <Row>
                    <div className="pull-right">
                        <CreateScenarioBtn parent={this}/>
                    </div>
                </Row>

                <Row>
                    <hr/>
                </Row>


                <Row>
                    <Griddle results={this.state.results}
                             useGriddleStyles={true}
                             showFilter={true} showSettings={true}
                             resultsPerPage={this.state.resultsPerPage}
                             columnMetadata={columnMeta}
                             columns={["name", "session", "status", "loaded", "last_used", "space_used_kb", "stub_count", "recorded", "actions"]}
                        />
                </Row>

            </Grid>
        );


        return gridInstance
    }
});

function BeginSession(that, scenario, session) {
    let sessionPayload = {
        "begin": null,
        "session": session,
        "mode": "record"
    };

    // making ajax call
    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify(sessionPayload),
        url: "/stubo/api/v2/scenarios/objects/" + scenario + "/action",
        success: function () {
            if (that.isMounted()) {
                that.setState({
                    message: "Session for scenario '" + scenario + "' started successfully!",
                    alertVisible: true,
                    alertStyle: "success"
                });
            }
        }
        }).fail(function ($xhr) {
        let data = jQuery.parseJSON($xhr.responseText);
        if (that.isMounted()) {
            that.setState({
                message: "Could not begin session. Error: " + data.error.message,
                alertVisible: true,
                alertStyle: "danger"
            });
        }
    });
}



let CreateScenarioBtn = React.createClass({
    getInitialState() {
        return {
            disabled: true,
            style: null,
            sessionInputDisabled: true,
            showModal: false,
            message: "",
            alertVisible: false,
            alertStyle: "danger",
            parent: this.props.parent
        }
    },

    close() {
        this.setState({showModal: false});
    },

    open() {
        this.setState({showModal: true});
    },

    validationState() {
        let length = this.refs.scenarioName.getValue().length;
        let sessionLength = this.refs.sessionName.getValue().length;

        let style = 'danger';

        if (this.state.sessionInputDisabled == false) {
            if (length > 0 && sessionLength > 0) {
                style = 'success'
            }
        } else {
            if (length > 0) {
                style = 'success'
            }
        }

        let disabled = style !== 'success';



        return {style, disabled};
    },

    handleChange()
    {
        this.setState(this.validationState());
    },

    handleCheckbox()
    {
        // inverting checkbox state
        this.state.sessionInputDisabled = !this.state.sessionInputDisabled;

        // doing validation
        this.setState(this.validationState());
    },


    handleSubmit(e)
    {
        e.preventDefault();

        let scenarioName = this.refs.scenarioName.getValue();

        let payload = {
            "scenario": scenarioName
        };

        let that = this;

        $.ajax({
            type: "PUT",
            dataType: "json",
            data: JSON.stringify(payload),
            url: "/stubo/api/v2/scenarios",
            success: function (data) {
                if (that.isMounted()) {
                    that.setState({
                        message: "Scenario '" + scenarioName + "' created successfully!",
                        alertVisible: true,
                        alertStyle: "success"
                    });
                }
                // session input is expected if that.state.sessionInputDisabled is enabled
                if (that.state.sessionInputDisabled == false) {
                    let sessionName = that.refs.sessionName.getValue();
                    BeginSession(that, scenarioName, sessionName)
                }
                updateTable(that.state.parent);

            }
        }).fail(function ($xhr) {
            if (that.isMounted()) {
                that.setState({
                    message: "Could not create scenario. Error: " + $xhr.statusText,
                    alertVisible: true,
                    alertStyle: "danger"
                });
            }
        });
    },

    handleAlertDismiss() {
        this.setState({alertVisible: false});
    },

    render() {

        let createForm = (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <Input type="text" ref="scenarioName" label="Scenario name"
                           placeholder="scenario-0"
                           onChange={this.handleChange}/>
                    <Input type="checkbox" ref="sessionCheckbox" label="Start session in record mode after scenario is created"
                           onChange={this.handleCheckbox}/>

                    <Input type="text" ref="sessionName" label="Session name"
                           placeholder="session-0"
                           disabled={this.state.sessionInputDisabled}
                           onChange={this.handleChange}/>

                    <ButtonInput type="submit" value="Submit"
                                 bsStyle={this.state.style} bsSize="small"
                                 disabled={this.state.disabled}/>
                </form>
            </div>
        );

        // alert style to display messages
        let alert = (<p></p>);
        if (this.state.alertVisible) {
            alert = (
                <Alert bsStyle={this.state.alertStyle} dismissAfter={10000} onDismiss={this.handleAlertDismiss}>
                    <p>{this.state.message}</p>
                </Alert>
            );
        }
        return (
            <span>
                <Button pullRigh={true}
                        onClick={this.open}
                        bsStyle="primary">
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Add new scenario
                </Button>

                <Modal show={this.state.showModal} onHide={this.close}
                       bsSize="medium">
                    <Modal.Header closeButton>
                        <Modal.Title>Add new scenario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {alert}
                        {createForm}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </span>
        );
    }
});


ReactDOM.render(
    <ExternalScenarios />,
    document.getElementById("app")
);