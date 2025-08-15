import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import axios from 'axios';

export default function App() {
  const [jsonData, setJsonData] = useState(null);
  const [successSync, setSuccessSync] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [validJsonData, setValidJsonData] = useState([]);

  // useEffect(() => {
  //   if (jsonData) {
  //     console.log('JSON Data:', jsonData);
  //   }
  // }, [jsonData]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const json = csvToJson(text);
      setJsonData(json);
      validateFile(json);
    };
    reader.readAsText(file);
  };

  const csvToJson = (csv) => {
    const lines = csv
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const headers = lines[0].split(',');

    return lines.slice(1).map((row) => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
        return obj;
      }, {});
    });
  };

  const handleSyncToHubspot = async () => {
    if (!jsonData) {
      console.error('No data to sync');
      return;
    }
    console.log(validJsonData);
    try {
      const res = await axios.post(
        'http://localhost:8000/leads/batch/',
        validJsonData
      );

      setResponseData(`
        Import Successful! Created ${res.data.created_contacts} contacts. Updated ${res.data.updated_contacts} contacts.
      `);
      setSuccessSync(true);
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      setResponseData(`
        Import Unsuccessful! Please try again.
      `);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      handleFileUpload(e);
    }
  };
  const handleClick = () => {
    fileInputRef.current.click();
  };

  const validateFile = (file) => {
    console.log('Validating file:', file);
    console.log('file type:', typeof file);
    if (!file || !Array.isArray(file)) {
      setUploadMessage('Please upload a valid CSV file.');
      return;
    }
    const validData = [];
    file.forEach((item) => {
      const email = item.email?.trim();
      const phone = item.phone?.replace(/\s+/g, '');

      const emailValid = email ? /^[\w.-]+@[\w.-]+\.\w+$/.test(email) : false;
      const phoneValid = phone ? /^\+?[1-9]\d{1,14}$/.test(phone) : false;

      if (emailValid || phoneValid) {
        validData.push(item);
      }
    });

    setValidJsonData(validData);
    if (validData?.length == file.length) {
      setUploadMessage(
        `You are trying to import ${validData.length} valid records.`
      );
    }

    setUploadMessage(
      `You are trying to import ${validData.length} valid records out of ${file.length} total records. If this is incorrect, please check your CSV file.`
    );
  };

  return (
    <div style={{ padding: '2em', maxWidth: '600px', margin: 'auto' }}>
      <h3 style={{ textAlign: 'center' }}>Upload CSV File here!</h3>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '1em' }}>
        Please make sure that there is atleast a valid email or phone number.
        Invalid email or contact number would not me imported to CRM
      </div>
      <div className="file-upload" onClick={handleClick}>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {fileName ? (
          <p className="file-name">Selected file: {fileName}</p>
        ) : (
          <p className="file-placeholder">
            Click or drag and drop a CSV file here
          </p>
        )}
      </div>
      <button className="sync_button" onClick={handleSyncToHubspot}>
        Import to Hubspot
      </button>
      <div></div>
      {uploadMessage && (
        <div className="message-container">{uploadMessage}</div>
      )}
      {responseData && (
        <div
          className={` message-container ${successSync ? 'response-success' : 'response-error'}`}
        >
          <div>Response Data:</div>
          <div>{responseData}</div>
        </div>
      )}
    </div>
  );
}
