import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import classnames from "classnames";
import Image from 'react-bootstrap/Image';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: {}
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dropzone");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/dropzone");
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const userData = {
      email: this.state.email,
      password: this.state.password
    };
    
    this.props.loginUser(userData);
  };

  render() {
    const { errors } = this.state;

    return (
      <div>
        <div style={{ 
          textAlign: "left", 
          margin: "10% auto 0 auto", 
          minWidth: "300px", 
          maxWidth: "400px"
        }} className="row">
          <div className="col s8" style={{ background: "white", padding: "50px", borderRadius: "5px" }}>
            <div style={{textAlign: "center", marginBottom: "25px"}}>
            <Image 
              src={require("../../images/gawai.png")}
              style={{width: "100px", textAlign: "center"}}/>
            </div>
            <h4 style={{
                fontFamily: 'Open Sans', 
                textAlign: "center",
                color: "rgb(22, 34, 82)"
              }}>
                Login in to your account
            </h4>
            <br/>
            <Form noValidate onSubmit={ this.onSubmit }>
              <div>
                <Form.Group>
                  <Form.Label style={{ textAlign: "left" }}>Email</Form.Label>
                  <Form.Control 
                    placeholder="Enter email"
                    onChange={ this.onChange }
                    value={ this.state.email }
                    error={ errors.email }
                    id="email"
                    type="email"
                    className={classnames("", {
                      invalid: errors.email || errors.emailnotfound
                    })}
                  />
                   <span style={{
                      color: "red", 
                      fontSize: "13px"
                     }}>
                    { errors.email }
                    { errors.emailnotfound }
                  </span>
                </Form.Group>
              </div>
              <div>
                <Form.Group>
                  <Form.Label style={{ textAlign: "left" }}>Password</Form.Label>
                  <Form.Control 
                    placeholder="Enter password"
                    onChange={this.onChange}
                    value={this.state.password}
                    error={errors.password}
                    id="password"
                    type="password"
                    className={classnames("", {
                      invalid: errors.password || errors.passwordincorrect
                    })}
                  />
                   <span style={{
                     color: "red",
                     fontSize: "13px"
                    }}>
                    { errors.password }
                    { errors.passwordincorrect }
                </span>
                </Form.Group>
              </div>
              <div style={{ textAlign: "center" }}>
                <Button                  
                  type="submit"
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem",
                    color: "white"
                  }}
                > 
                  Login
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { loginUser }
)(Login);