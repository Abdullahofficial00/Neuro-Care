document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const fileUpload = document.getElementById('fileUpload');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const eegChart = document.getElementById('graph').getContext('2d');
    const eegTable = document.getElementById('eegTable');
    const seizureLogContainer = document.querySelector('.seizure-log-container');

    let allEEGData = [];  // To store all EEG data for logs and report
    let chart;
    let streamSource;
    let seizureLog = [];
    let seizureThreshold = 40;  // Example threshold for seizure detection
    let windowSize = 100; // 100 seconds visible at a time

    // Upload form handler
    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();
        handleFileUpload();
    });

    function handleFileUpload() {
        const file = fileUpload.files[0];

        if (!file) {
            alert('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'File uploaded successfully.') {
                startEEGStream();
            } else {
                alert('Error uploading file: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to upload file');
        });
    }

    // Start EEG Stream
    // Start EEG Stream
function startEEGStream() {
    // Close the existing stream if it is open
    if (streamSource && streamSource.readyState === EventSource.OPEN) {
        streamSource.close();
        console.log("Previous stream closed.");
    }

    // Initialize a new stream
    streamSource = new EventSource('/stream');
    
    // Handle incoming messages
    streamSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.error) {
            console.error(data.error);
            return;
        }

        if (data.time && data.eeg) {
            processEEGData(data);
        }
    };

    // Handle errors in the stream
    streamSource.onerror = function () {
        console.error("Error in streaming data.");
        streamSource.close();
    };

    // Optionally log when the stream is opened successfully
    streamSource.onopen = function () {
        console.log("Stream opened successfully.");
    };
}


    // Process incoming EEG data
    // Process incoming EEG data
function processEEGData(eegData) {
    const label = eegData.time;
    const data = eegData.eeg;

    if (!chart) {
        chart = new Chart(eegChart, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'EEG Signal',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0, // Hide points for smoother line
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time (s)'
                        },
                        min: 0,
                        max: windowSize, // show first 100 seconds initially
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'EEG Value'
                        }
                    }
                }
            }
        });
    }

    // Add new data point to chart
    const newTime = label[label.length - 1];
    const newEEG = data[data.length - 1];

    chart.data.labels.push(newTime);
    chart.data.datasets[0].data.push(newEEG);

    // Update visible window if necessary
    if (newTime > chart.options.scales.x.max) {
        chart.options.scales.x.min += 1;  // Slide window
        chart.options.scales.x.max += 1;
    }

    // Limit the number of data points to optimize performance
    if (chart.data.labels.length > 1000) {  // Limit to 1000 points
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    // Update chart without animation
    chart.update('none');

    // Save data for logs & reports
    allEEGData.push({ time: newTime, eeg: newEEG });

    // Detect seizure condition
    if (Math.abs(newEEG) > seizureThreshold) {
        detectSeizure(newTime, newEEG);
    }

    // Update UI Panels
    updateEEGTable(newTime, newEEG);
    updateLogPanel();
    updateReportPanel();
}


    // Function to update EEG data table
    function updateEEGTable(time, eegValue) {
        // Ensure the table is selected correctly
        let tableBody = eegTable.querySelector('tbody'); // Correct way to get tbody
        if (!tableBody) {
            console.error("Table body not found.");
            return;
        }
    
        const alertMessage = eegValue > 30 ? 'High EEG Value!' : '  ';  // Change condition as needed
    
        // Insert a new row
        let newRow = tableBody.insertRow();
    
        // Create cells for Time, EEG value, Seizure detection, and Alerts
        let cellTime = newRow.insertCell(0);
        let cellEEG = newRow.insertCell(1);
        // let cellSeizure = newRow.insertCell(2);
        let cellAlerts = newRow.insertCell(2);
    
        // Format EEG value to 3 digits after decimal
        let formattedEEG = parseFloat(eegValue).toFixed(3);
    
        // Assign values to the cells
        cellTime.textContent = time;
        cellEEG.textContent = formattedEEG;
        // cellSeizure.textContent = Math.abs(eegValue) > seizureThreshold ? 'Yes' : 'No';
        cellAlerts.textContent = alertMessage;
    }
    
    
    

    // Function to update Log Panel
    function updateLogPanel() {
        const latestLogs = allEEGData.slice(-10).map(item => {
            return `<div>Time: ${item.time}s | EEG: ${item.eeg.toFixed(2)}</div>`;
        }).join('');

        const logContent = document.querySelector('.report-panel .content');
        logContent.innerHTML = `
            <h3>LOGs</h3>
            ${latestLogs}
        `;
    }

    // Function to update Report Panel
    function updateReportPanel() {
        if (allEEGData.length === 0) {
            console.log("No EEG data to show in report.");
            return;
        }
    
        const eegValues = allEEGData.map(item => item.eeg);
        const avg = (eegValues.reduce((a, b) => a + b, 0) / eegValues.length).toFixed(2);
        const min = Math.min(...eegValues).toFixed(2);
        const max = Math.max(...eegValues).toFixed(2);
    
        let reportSection = document.querySelector('.live-report');
        if (!reportSection) {
            reportSection = document.createElement('div');
            reportSection.classList.add('live-report');
            document.querySelector('.graph-panel').appendChild(reportSection);
        }
    
        reportSection.innerHTML = `
            <h3>Live Report</h3>
            <p><strong>Average EEG:</strong> ${avg}</p>
            <p><strong>Minimum EEG:</strong> ${min}</p>
            <p><strong>Maximum EEG:</strong> ${max}</p>
        `;
    }
    
    

    // Function to handle Seizure Detection
    function detectSeizure(time, eegValue) {
        const seizureEntry = document.createElement('div');
        seizureEntry.classList.add('seizure-entry');
        seizureEntry.innerHTML = `Seizure detected at ${time}s | EEG Value: ${eegValue}`;

        seizureLogContainer.appendChild(seizureEntry);

        // Limit the number of seizure detections in the log to avoid overflow
        if (seizureLogContainer.children.length > 50) {
            seizureLogContainer.removeChild(seizureLogContainer.firstChild); // Remove oldest entry
        }
    }

});

document.getElementById('submitPatientDetails').addEventListener('click', function (event) {
    event.preventDefault();  // Prevent form from submitting the traditional way
    submitPatientData();  // Function to submit patient data
});

function submitPatientData() {
    const patientName = document.getElementById('patientName').value;
    const caregiverName = document.getElementById('caregiverName').value;
    const caregiverPhone = document.getElementById('caregiverPhone').value;
    const patientAge = document.getElementById('patientAge').value;
    const patientIssue = document.getElementById('patientIssue').value;

    // Create an object with patient details
    const patientDetails = {
        name: patientName,
        caregiver_name: caregiverName,
        caregiver_phone: caregiverPhone,
        patient_age: patientAge,
        patient_issue: patientIssue
    };

    // Send the patient data to the server
    fetch('/upload_patient_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientDetails)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Patient data uploaded successfully.') {
            alert('Patient data uploaded successfully!');
        } else {
            alert('Error uploading patient data: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to upload patient data');
    });
}


function generateReport() {
    fetch('/generate_report', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Report generated successfully") {
            // Update seizure timestamps table
            const tableBody = document.getElementById('timestampsTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = '';  // Clear any existing rows

            // Create rows of 4 timestamps
            const seizureTimes = data.seizure_times;
            for (let i = 0; i < seizureTimes.length; i += 4) {
                const row = document.createElement('tr');

                // Add timestamps to row
                for (let j = 0; j < 4; j++) {
                    const cell = document.createElement('td');
                    const timestamp = seizureTimes[i + j];
                    cell.textContent = timestamp !== undefined ? `${timestamp.toFixed(3)} s` : '';  // Add timestamp or empty if undefined
                    row.appendChild(cell);
                }

                // Append the row to the table
                tableBody.appendChild(row);
            }
        } else {
            console.error('Error:', data.error);
        }
    })
    .catch(error => console.error('Error generating report:', error));
}
