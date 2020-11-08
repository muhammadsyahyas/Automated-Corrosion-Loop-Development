import React, { Component } from 'react';
import Dropzone from '../Dropzone/Dropzone';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Switch from 'react-bootstrap/esm/Switch';
import Button from 'react-bootstrap/esm/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";


class Processor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionChosen: "",
      projectName: "",
      pdfFile: [],
      nameSet: false,
      createTemplate: false,
      fileSet: false,
      waitProcessing: true, 
      finishProcessing: false,
      reset: false,
      isCreateTemplateReady: false,
    };
  }
  
  componentDidMount() {
    this.hydrateStateWithLocalStorage();
    // add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener(
      "beforeunload",
      this.saveStateToLocalStorage.bind(this)
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      "beforeunload",
      this.saveStateToLocalStorage.bind(this)
    );

    // saves if component has a chance to unmount
    this.saveStateToLocalStorage();
  }

  hydrateStateWithLocalStorage() {
    // for all items in state
    for (let key in this.state) {
      // if the key exists in localStorage
      if (localStorage.hasOwnProperty(key)) {
        // get the key's value from localStorage
        let value = localStorage.getItem(key);
        // parse the localStorage string and setState
        try {
          value = JSON.parse(value);
          this.setState({ [key]: value });
        } catch (e) {
          // handle empty string
          this.setState({ [key]: value });
        }
      }
    }
  }

  saveStateToLocalStorage() {
    // for every item in React state
    for (let key in this.state) {
      // save to localStorage
      localStorage.setItem(key, JSON.stringify(this.state[key]));
    }
  }

  createTemplateReadyHandler = () => {
    this.setState({ isCreateTemplateReady: true });
  }

  createTemplateNotReadyHandler = () => {
    this.setState({ isCreateTemplateReady: false });
  }

  // Call this function when a PDF has been set (dropped, but not necessarily uploaded)
  setPDFFile = (file) => {
    this.setState({ pdfFile: file })
  }

  // Call this function when a PDF has been deleted
  deletePDFFile = () => {
    this.setState({ pdfFile: [] })
  }

  // Call this function when processing stage has been finished
  updateFinishState = () => {
    this.setState({ finishProcessing: true, 
                    waitProcessing: false });
  }

  // Call this function when processing stage has been finished
  waitFinishState = () => {
    this.setState({  waitProcessing: true });
  }

  // Call this function when the project name is changed
  handleNameChange = event => {
    this.setState({ projectName: event.target.value });
  }

  // Call this function when the project name has been set
  handleNameSubmission = () => {
    this.setState({ nameSet: true });
  }

  // Call this function when the project name has been revoked (back button is pressed)
  handleNameRevoke = () => {
    this.setState({ nameSet: false });
  }

  handlePDFSubmission = () => {
    this.setState({ fileSet: true });
  }

  handlePDFRevoke = () => {
    this.setState({ fileSet: false });
  }

  handleNewProject = () => {
    this.setState({ optionChosen: "newproject" });
  }

  handleExistingProject = () => {
    this.setState({ optionChosen: "existingproject" });
  }

  createTemplateHandler = () => {
    this.setState({ createTemplate: true });
  }

  cancelCreateTemplateHandler = () => {
    this.setState({ 
      createTemplate: false
    });
  }
  
  openProject = (openedProject) => {
    this.setState({ projectName: openedProject })
  }

  resetHandler = () => {
    this.setState({ 
      optionChosen: "",
      projectName: "",
      pdfFile: [],
      nameSet: false,
      createTemplate: false,
      fileSet: false,
      waitProcessing: false, 
      finishProcessing: false,
      reset: true 
    });
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  componentDidUpdate() {
    if (this.state.reset) {
      this.setState({ reset: false });
    }
  }

  render () {
    const setProject = 
      <Dropzone 
        fileSet={ this.handlePDFSubmission }
        setPDFFile={ this.setPDFFile }
        deletePDFFile={ this.deletePDFFile }
        nameRevoke={ this.handleNameRevoke }
        projectName={ this.state.projectName }
        userId={ this.props.auth.user.id }
        pdfFile={ this.state.pdfFile }
      />;
    
    var logoutButton = (
      <Button 
        onClick={ this.onLogoutClick }
        variant="light"
        style={{
          position: "fixed",
          bottom:"3%",
          left:"93%",
        }}>
          <FontAwesomeIcon icon={ faSignOutAlt } /> Logout
      </Button>
    )
    
    return (
      <Router>
        <Switch>
          <Route path="/dropzone">
            { setProject }
          </Route>
        </Switch>
        { logoutButton }
      </Router>
    )
  }
}

Processor.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(Processor);