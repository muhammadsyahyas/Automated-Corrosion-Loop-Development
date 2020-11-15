import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import classes from './Dropzone.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image';
import { Col } from 'react-bootstrap';


function Dropzone (props) {
  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [featureNames, setFeatureNames] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState({});
  const [showSpinner, setShowSpinner] = useState(false);
  const [isFinishedUpload, setIsFinishedUpload] = useState(false);
  const [isWaitingProcess, setIsWaitingProcess] = useState(false);
  const [isFinishedProcess, setIsFinishedProcess] = useState(false);
  const [isSuccesfulAlertOpened, setIsSuccesfulAlertOpened] = useState(false);
  const [isSuccesfulProcessOpened, setIsSuccesfulProcessOpened] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        props.setPDFFile(acceptedFiles);
      }
      reader.readAsArrayBuffer(file);
    })
  }, [props])

  const handleClickUpload = async () => {
    setIsFinishedUpload(false);
    if (acceptedFiles[0]) {
      setShowSpinner(true);
      console.log("Uploading file to server...");
      var fd = new FormData();
      fd.append('file', acceptedFiles[0]);
      fd.append('userId', props.userId);
      await axios.post('http://localhost:5000/api/process/upload', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }, { timeout: 0 })
      .then((response) => {
        console.log("Finish uploading Excel file.");
        const uploadInfo = JSON.parse(response.data);
        setInputPath(uploadInfo.inputPath);
        setOutputPath(uploadInfo.outputPath);
        setFeatureNames(uploadInfo.featureNames);
        setShowSpinner(false);
        setIsFinishedUpload(true);
        setIsSuccesfulAlertOpened(true);
        setTimeout(() => {
          setIsSuccesfulAlertOpened(false);
        }, 2000)
      })
      .catch((error) => {
        console.log(error.message);
      })
    } 
  };

  const handleClickDelete = () => {
    props.deletePDFFile();
    setIsFinishedUpload(false);
    setIsFinishedProcess(false);
  }

  const handleClickSubmit = () => {
    setIsWaitingProcess(true);
    fetch('http://localhost:5000/api/process/grouping', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputPath: inputPath,
        outputPath: outputPath,
        selectedFeatures: selectedFeatures})
    });
    setTimeout(() => {
      setIsFinishedProcess(true);
      setIsWaitingProcess(false);
      setIsSuccesfulProcessOpened(true);
      setTimeout(() => {
        setIsSuccesfulProcessOpened(false);
      }, 2000);
    }, 5000);
    
  }

  const handleClickDownload = () => {
    fetch('http://localhost:5000/api/process/download', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({outputPath: outputPath})
    });
  }

  const {
    acceptedFiles,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: '.xlsx', onDrop
  });

  const dropZone = (props.pdfFile.length === 0 && !isFinishedUpload) ? (
    <div className={ classes.dropzone }>
      <div { ...getRootProps({className: "dropzone" })}>
        <input { ...getInputProps() } />
        <p>Drag and drop an Excel file here</p>
      </div>
      <p style={{ 
        textAlign: "left", 
        font: "Helvetica Neue", 
        color:"grey", 
        fontSize: "13px", 
        marginTop: "7px" 
      }}>
        Only an Excel file is allowed.
      </p>
    </div>
  ) : null;
  
  const delButton = (
    <Button
      onClick = { handleClickDelete }
      type="button" 
      style={{ textAlign: "right", marginRight: "20px" }} 
      variant="danger" 
      size="sm"
      disabled={ showSpinner }>
        <FontAwesomeIcon icon={ faTimes } />
    </Button>
  );

  let uploadButton;
  if (!isFinishedUpload) {
    uploadButton = (
      <Button 
        onClick={ handleClickUpload } 
        type="button"
        disabled={ props.pdfFile.length === 0 || showSpinner }
      >
        { 
          showSpinner ? 
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
          /> : null
        } 
        { 
          showSpinner ? ' Uploading ...' : "Upload" 
        }
      </Button>
    ); 
  }

  let submitButton;
  let successAlert;
  if (isFinishedUpload && !isFinishedProcess && !isWaitingProcess) {
    submitButton = (
      <Button 
        onClick={ handleClickSubmit } 
        type="button"
      >
        Submit
      </Button>
    ); 
  } else if (isWaitingProcess) {
    submitButton = (    
      <Button 
        onClick={ handleClickSubmit } 
        type="button"
        disabled
      >
        <Spinner
          as="span"
          animation="grow"
          size="sm"
          role="status"
          aria-hidden="true"
        />
          Processing ...
      </Button>
    ); 
  }

  if (isFinishedUpload && isSuccesfulAlertOpened) {
    successAlert = (
      <Alert 
        variant="success" 
        onClose={ () => setIsSuccesfulAlertOpened(false) } 
        dismissible
        style={{ marginTop: "20px"}}
      >
        <h6>
          File upload is successful!
        </h6>
      </Alert>
    );
  }

  let downloadButton;
  let newFileButton;
  let processAlert;
  if (isFinishedProcess) {
    downloadButton = (
      <Button 
        onClick={ handleClickDownload } 
        type="button"
        variant="success"
      >
        Download result
      </Button>
    ); 
    newFileButton = (
      <Button 
        onClick={ handleClickDelete } 
        type="button"
        style={{ marginLeft: "20px" }} 
      >
        Upload a new file
      </Button>
    ); 
  }

  if (isFinishedProcess && isSuccesfulProcessOpened) {
    processAlert = (
      <Alert 
        variant="success" 
        onClose={ () => setIsSuccesfulAlertOpened(false) } 
        dismissible
        style={{ marginTop: "20px"}}
      >
        <h6>
          Corrosion looping process is successful!
        </h6>
      </Alert>
    );
  }

  let uploadedPdf;
  if (!isFinishedProcess) {
    uploadedPdf = props.pdfFile.map((file, index) => (
      <Card key={ index }>
        <Card.Body>
          <Card.Text style={{ textAlign: "left" }}>
            <span>
              { delButton }
            </span>
            { file.path }
          </Card.Text>
        </Card.Body>
      </Card>  
    ));
  }
  
  const handleCheckboxChange = (clickedFeature) => {
    if (clickedFeature in selectedFeatures) {
      var temp = {...selectedFeatures};
      delete temp[clickedFeature];
      setSelectedFeatures(temp);
    } else {
      var temp = {...selectedFeatures};
      temp[clickedFeature] = ["",""];
      setSelectedFeatures(temp);
    }
  };

  const handleDataTypeFormChange = (type, feature) => {
    var temp = {...selectedFeatures};
    temp[feature][0] = type;
    setSelectedFeatures(temp);
  }

  const handleDiffFormChange = (diff, feature) => {
    var temp = {...selectedFeatures};
    temp[feature][1] = diff;
    setSelectedFeatures(temp);
  }

  var checkBoxes;
  var title = "Upload an Excel file";

  if(isFinishedProcess) {
    title = "Download result";
  }
  

  if (props.pdfFile.length !== 0 && isFinishedUpload && !isFinishedProcess) {
    title = "Set parameters"
    checkBoxes = (
      <div style={{ textAlign: "left" }}>
        <Form>
          {featureNames.map((feature) => {
            if (feature in selectedFeatures) {
              if (selectedFeatures[feature][0] === "Numerical") {
                return(
                  <div key={ feature } style={{ marginBottom: "5px" }}>
                    <Form.Row>
                      <Col>
                        <Form.Check 
                          type="checkbox"
                          key={ feature }
                          id={ feature }
                          label={ feature }
                          checked= {true }
                          onChange={ () => handleCheckboxChange(feature) }
                        /> 
                      </Col>
                      <Col>
                        <Form.Control 
                          as="select"
                          size="sm"
                          onChange={ e => handleDataTypeFormChange(e.target.value, feature) }
                        >
                          <option>Data type</option>
                          <option value="Numerical">Numerical</option>
                          <option value="Categorical">Categorical</option>
                        </Form.Control>
                      </Col>
                      <Col>
                        <Form.Control 
                          type="number"
                          size="sm"
                          placeholder="Max Diff"
                          onChange={ e => handleDiffFormChange(e.target.value, feature) }
                        />
                      </Col>
                    </Form.Row>
                  </div>
                )
              } else {
                return (
                  <div key={ feature } style={{ marginBottom: "5px" }}>
                    <Form.Row>
                      <Col>
                        <Form.Check 
                          type="checkbox"
                          key={ feature }
                          id={ feature }
                          label={ feature }
                          checked= {true }
                          onChange={ () => handleCheckboxChange(feature) }
                        /> 
                      </Col>
                      <Col>
                        <Form.Control 
                          as="select"
                          size="sm"
                          onChange={ e => handleDataTypeFormChange(e.target.value, feature) }
                        >
                          <option>Data type</option>
                          <option value="Numerical">Numerical</option>
                          <option value="Categorical">Categorical</option>
                        </Form.Control>
                      </Col>
                      <Col>
                        <Form.Control 
                          as="text"
                          size="sm"
                          disabled
                        />
                      </Col>
                    </Form.Row>
                  </div>
                )
              }
            }
            else {
              return(
                <div key={ feature } style={{ marginBottom: "5px" }}>
                  <Form.Row>
                    <Col>
                      <Form.Check 
                        type="checkbox"
                        defaultChecked={ false }
                        key={ feature }
                        id={ feature }
                        label={ feature }
                        onChange={ () => handleCheckboxChange(feature) }
                      /> 
                    </Col>
                    <Col>
                      <Form.Control 
                        as="select"
                        size="sm"
                        disabled
                      >
                      </Form.Control>
                    </Col>
                    <Col>
                      <Form.Control 
                        as="text"
                        size="sm"
                        disabled
                      />
                    </Col>
                  </Form.Row>
                </div>
              )}
            }
          )}
        </Form>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", margin: "10% auto 10% auto", minWidth: "400px", maxWidth: "500px" }}>
      <div style={{ background: "white", padding: "50px", borderRadius: "5px" }}>
      <Image 
        src={ require("../../images/gawai.png") }
        style={{ width: "110px", textAlign: "center", marginBottom: "25px" }}
      />
      <br/>
      <h2 style={{ fontFamily: 'Open Sans', color: "rgb(22, 34, 82)" }}>
        { title }
      </h2>
      <br/>
      <Form> 
          { dropZone }      
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
          { uploadedPdf }
        </div>
        { checkBoxes }
        <div style={{ textAlign: "center", marginTop: "20px", marginRight: "20px" }}>
          { uploadButton }
          { submitButton }
          { downloadButton }
          { newFileButton }
        </div>
      </Form>
      </div>
      { successAlert }
      { processAlert }
    </div>
  );
}

export default Dropzone;