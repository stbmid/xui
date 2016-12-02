/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col } from 'react-bootstrap';
import { Link } from 'react-router';

class NewSIPProfile extends React.Component {
	propTypes: {handleNewSIPProfileAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.last_id = 0;
		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var profile = form2json('#newSIPProfileForm');

		if (!profile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/sip_profiles",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(profile),
			success: function () {
				_this.last_id++;
				profile.id = "NEW" + _this.last_id;
				_this.props["data-handleNewSIPProfileAdded"](profile);
			},
			error: function(msg) {
				console.error("sip_profile", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		return <Modal {...this.props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New SIP Profile" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newSIPProfileForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="profile1" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><FormControl type="input" name="description" placeholder="Description ..." /></Col>
				</FormGroup>

				<FormGroup controlId="formTemplate">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Template"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="template">
							<option value="default">Default</option>
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class EditControl extends FormControl {
	constructor(props) {
		super(props);
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.edit;

		if (this.props.edit) {
			return <FormControl {...props} />
		}

		return <span>{props.defaultValue}</span>
	}

}

class SIPProfilePage extends React.Component {
	propTypes: {handleNewSIPProfileAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: '', profile: {}, edit: false};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var profile = form2json('#newSIPProfileForm');

		if (!profile.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/sip_profiles/" + profile.id,
			headers: {"X-HTTP-Method-Override": "PUT"},
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(profile),
			success: function () {
				_this.setState({profile: profile, errmsg: {key: "Saved at", time: Date()}})
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/sip_profiles/" + this.props.params.id, "", function(data) {
			_this.setState({profile: data});
		}, function(e) {
			console.log("get profile ERR");
		});
	}

	render() {
		const profile = this.state.profile;
		let save_btn = "";
		let err_msg = "";
		let params = "";

		if (this.state.profile.params && Array.isArray(this.state.profile.params)) {
			console.log(this.state.profile.params)
			params = this.state.profile.params.map(function(param) {
				return <tr key={param.id}>
					<td>{param.k}</td>
					<td>{param.v}</td>
					<td>{param.disabled ? "False" : "True"}</td>
				</tr>
			});
		}

		if (this.state.edit) {
			save_btn = <Button><T.span onClick={this.handleSubmit} text="Save"/></Button>

			if (this.state.errmsg) {
				err_msg  = <Button><T.span text={this.state.errmsg} className="danger"/></Button>
			}
		}

		return <div>
			<ButtonGroup className="controls">
				{err_msg} { save_btn }
				<Button><T.span onClick={this.handleControlClick} text="Edit"/></Button>
			</ButtonGroup>

			<h1>{profile.name} <small>{profile.extn}</small></h1>
			<hr/>

			<Form horizontal id="newSIPProfileForm">
				<input type="hidden" name="id" defaultValue={profile.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={profile.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={profile.description}/></Col>
				</FormGroup>
			</Form>

			<h2>Params</h2>
			<table className="table">
				<tbody>
				<tr>
					<th>Name</th>
					<th>Value</th>
					<th>Enabled</th>
				</tr>
				{params}
				</tbody>
			</table>
		</div>
	}
}

class SIPProfilesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		$.ajax({
			type: "DELETE",
			url: "/api/sip_profiles/" + id,
			success: function () {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/sip_profiles", "", function(data) {
			_this.setState({rows: data});
		}, function(e) {
			console.log("get sip_profiles ERR");
		});
	}

	handleFSEvent(v, e) {
	}

	handleSIPProfileAdded(route) {
		var rows = this.state.rows;
		rows.push(route);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/sip_profiles/${row.id}`}>{row.name}</Link></td>
					<td>{row.description}</td>
					<td>{row.disabled ? "True" : "False"}</td>
					<td></td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<div className="controls">
				<Button>
					<i className="fa fa-plus" aria-hidden="true"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</div>

			<h1><T.span text="SIP Profiles"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Enabled"/></th>
					<th><T.span text="Status"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewSIPProfile show={this.state.formShow} onHide={formClose} data-handleNewSIPProfileAdded={this.handleSIPProfileAdded.bind(this)}/>
		</div>
	}
}

export {SIPProfilesPage, SIPProfilePage};
