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
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    setResponseData(null);
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
        const value = values[index]?.trim() || '';

        if (header.toLowerCase() === 'name') {
          // Split name into first and last
          const [first, ...rest] = value.split(' ');
          obj['firstname'] = first || '';
          obj['lastname'] = rest.join(' ') || '';
        } else {
          obj[header] = value;
        }
        return obj;
      }, {});
    });
  };

  const handleSyncToHubspot = async () => {
    setLoading(true);
    if (!jsonData) {
      console.error('No data to sync');
      setUploadMessage('Please upload a CSV file.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:8000/leads/batch/',
        validJsonData
      );

      setResponseData(
        `Import Successful! Created ${res.data.created_count} contacts. Updated ${res.data.updated_count} contacts. And ${res.data.error_count} failed import.`
      );
      setSuccessSync(true);
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      setResponseData(`Import Unsuccessful! Please try again.`);
    }
    setLoading(false);
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
    if (!file || !Array.isArray(file)) {
      setUploadMessage('Please upload a valid CSV file.');
      return;
    }
    const validData = [];
    const invalidData = [];
    const seen = [];
    file.forEach((item) => {
      const email = item.email?.trim();
      if (!email) {
        invalidData.push({ item: item, error: 'Email is required' });
        return;
      }
      if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
        invalidData.push({ item: item, error: 'Invalid email format' });
        return;
      }
      if (seen.includes(email)) {
        invalidData.push({ item: item, error: 'Duplicate email' });
        return;
      }
      validData.push(item);
      seen.push(item.email);
    });

    setValidJsonData(validData);
    if (validData?.length == file.length) {
      setUploadMessage(
        `You are trying to import ${validData.length} valid records.`
      );
    }

    let warningMessage = `You are trying to import ${validData.length} valid records out of ${file.length} total records. If this is incorrect, please check your CSV file.`;
    console.log('Invalid Data:', invalidData);
    if (invalidData.length > 0) {
      warningMessage += `\nInvalid records found:`;
      invalidData.forEach((row) => {
        warningMessage += `\n${row.item.firstname || ''} ${row.item.lastname || ''}, ${row.item.email || 'No email'} - ${row.error || ''}`;
      });
    }

    setUploadMessage(warningMessage);
  };

  return (
    <div style={{ padding: '2em', maxWidth: '600px' }}>
      <h3 style={{ textAlign: 'center' }}>Upload CSV File here!</h3>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '1em' }}>
        Please make sure that there is a valid email. Invalid email would not me
        imported to CRM.
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
          <p className="file-placeholder">Click to upload CSV file</p>
        )}
      </div>
      <button className="sync_button" onClick={handleSyncToHubspot}>
        {!loading ? 'Import to Hubspot' : 'Importing...'}
      </button>
      {uploadMessage && (
        <div className="message-container" style={{ textAlign: 'left' }}>
          {uploadMessage}
        </div>
      )}
      {responseData && !loading && (
        <div
          style={{ textAlign: 'center' }}
          className={` message-container ${successSync ? 'response-success' : 'response-error'}`}
        >
          <div>{responseData}</div>
        </div>
      )}
    </div>
  );
}
