let chart, streamSource;
const fileUpload = document.getElementById('fileUpload');
const dragDropZone = document.getElementById('dragDropZone');
const eegChartCtx = document.getElementById('graph').getContext('2d');
const eegTable = document.getElementById('eegTable');
const seizureLogContainer = document.querySelector('.seizure-log-container');
const saveGraphBtn = document.getElementById('saveGraphButton');
let allEEGData = [];
/* These lines of code are initializing variables used in an EEG (Electroencephalogram) monitoring
system: */
const seizureThreshold = 40;
const viewWindowSize = 100;
let windowStart = 0;
let userIsFollowing = true;
let isLogFollowing = true;

document.addEventListener('DOMContentLoaded', () => {
    
    console.log("JS Loaded");
    document.getElementById('followLive').addEventListener('click', () => followLive());


    // Drag & Drop
    dragDropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dragDropZone.classList.add('dragover');
    });
    dragDropZone.addEventListener('dragleave', () => dragDropZone.classList.remove('dragover'));
    dragDropZone.addEventListener('drop', e => {
        e.preventDefault();
        dragDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileUpload.files = e.dataTransfer.files;
            fileUpload.dispatchEvent(new Event('change'));
        }
    });

    fileUpload.addEventListener('change', () => {
        const file = fileUpload.files[0];
        if (!file) return alert('No file selected');
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'File uploaded successfully.') {
                    resetChart();
                    allEEGData = [];
                    startEEGStream();
                    generateReport();
                    updateReportPanel();
                } else alert(data.error || 'Upload failed');
            }).catch(err => alert('Upload error: ' + err.message));
    });
    function resetChart() {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        if (eegChartCtx) {
            eegChartCtx.clearRect(0, 0, eegChartCtx.canvas.width, eegChartCtx.canvas.height);
        }
    }

    function startEEGStream() {
        if (streamSource) streamSource.close();
        streamSource = new EventSource('/stream');

        streamSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Streamed data:", data);

            // Check for error messages
            if (data?.error) {
                console.error("Stream error:", data.error);
                return;
            }

            // Expecting 'eeg' as 2D array [channel][samples] and 'time' as 1D array
            if (Array.isArray(data?.eeg) && Array.isArray(data?.time)) {
                processEEGData(data);  // Pass the whole object as expected
            }
        };

        streamSource.onerror = () => {
            console.error("EEG stream connection closed or failed.");
            streamSource.close();
        };
    }


    

    function initChart() {
        if (chart) return;
        const eegChannelLabels = ["Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4", "O1", "O2","F7", "F8", "T3", "T4", "T5", "T6", "Fz", "Cz", "Pz"];
        chart = new Chart(eegChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: eegChannelLabels.map((label, i) => ({
                    label: label,
                    data: [],
                    borderColor: `hsl(${(i * 360) / eegChannelLabels.length}, 70%, 50%)`,
                    pointRadius: 0,
                    tension: 0.1
                }))
            },
            options: {
                animation: true,
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        min: windowStart,
                        max: windowStart + viewWindowSize,
                        title: { display: true, text: 'Time (s)' }
                    },
                    y: {
                        title: { display: true, text: 'EEG Value' }
                    }
                },
                plugins: { legend: { display: true } }
            }
        });


        // Scroll to move window
        const graphContainer = document.getElementById('graph').parentElement;

        let isDragging = false;
        let startX = 0;
        let startWindowStart = 0;

        graphContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startWindowStart = windowStart;  // remember current window start
            graphContainer.style.cursor = 'grabbing';
        });

        graphContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;   // how far mouse has moved horizontally
            const pixelsPerStep = 10;        // sensitivity, adjust for speed

            // Calculate the change in terms of "steps"
            const deltaSteps = dx / pixelsPerStep;

            const latest = allEEGData.at(-1)?.time || 0;
            const maxStart = Math.max(0, latest - viewWindowSize);

            // Adjust windowStart relative to where it was when drag started
            // Moving mouse right (dx > 0) should move chart to left (scroll backward),
            // so we subtract deltaSteps
            windowStart = startWindowStart - deltaSteps;

            // Clamp the value so it stays between 0 and maxStart
            windowStart = Math.min(Math.max(0, windowStart), maxStart);

            userIsFollowing = false;
            updateChartWindow();
        });

        ['mouseup', 'mouseleave'].forEach(event => {
            graphContainer.addEventListener(event, () => {
                isDragging = false;
                graphContainer.style.cursor = 'default';
            });
        });


    }

    function followLive() {
        userIsFollowing = true;
        if (allEEGData.length) {
            const latest = allEEGData.at(-1).time;
            windowStart = latest - viewWindowSize;
            updateChartWindow();
        }
    }

    function updateChartWindow() {
        chart.options.scales.x.min = windowStart;
        chart.options.scales.x.max = windowStart + viewWindowSize;
        chart.update('none');
    }
    let inSeizure = Array(19).fill(false);
    function processEEGData({ time, eeg }) {
        // Validate input: time should be array, eeg should be 2D array [channels][samples]
        if (!Array.isArray(time) || !Array.isArray(eeg) || !Array.isArray(eeg[0])) {
            console.warn("Invalid EEG or time data:", { time, eeg });
            return;
        }
        
        initChart(); // Make sure chart is initialized
        
        const lastTime = time.at(-1);
        if (lastTime === undefined) {
            console.warn("No last time value found");
            return;
        }

        // Append new data points for each channel
        eeg.forEach((channelEEG, channelIndex) => {
            const lastEEG = channelEEG.at(-1);
            if (lastEEG === undefined) return;

            // Push last sample for this channel
            if (!chart.data.datasets[channelIndex]) {
                console.warn(`Dataset for channel ${channelIndex} not found`);
                return;
            }
            chart.data.datasets[channelIndex].data.push({ x: lastTime, y: lastEEG });

            // Seizure detection per channel
            if (Math.abs(lastEEG) > seizureThreshold) {
                if (!inSeizure[channelIndex]) {
                    detectSeizure(lastTime, lastEEG, channelIndex);
                    inSeizure[channelIndex] = true;
                }
            } else {
                inSeizure[channelIndex] = false;
            }
        });

        // Add time label for X axis - only one per chunk
        chart.data.labels.push(lastTime);

        // Dynamically adjust Y-axis min/max across all channels to cover all data
        let allYs = [];
        chart.data.datasets.forEach(ds => {
            ds.data.forEach(point => allYs.push(point.y));
        });

        const maxY = Math.max(...allYs.map(Math.abs), seizureThreshold) || 1;
        chart.options.scales.y.min = -maxY * 1.1; // add some padding
        chart.options.scales.y.max = maxY * 1.1;

        // Auto-scroll the time window if user is following
        if (userIsFollowing && lastTime > windowStart + viewWindowSize) {
            windowStart = lastTime - viewWindowSize;
        }
        updateChartWindow();

        // Update EEG table with last EEG value per channel
        updateEEGTable(lastTime, eeg.map(channel => channel.at(-1)));

        // Update report panel (your logic)
        updateReportPanel();

        // Update chart without animation for smooth real-time update
        chart.update('none');
    }



    function updateEEGTable(time, eeg) {
        const tbody = eegTable.querySelector('tbody');
        const row = tbody.insertRow();

        // Threshold configuration
        const threshold = 35;
        let alertDetected = false;

        // First column: Time (bold)
        let rowHTML = `<td><strong>${time.toFixed(2)}</strong></td>`;

        // Loop over EEG channels
        eeg.forEach(channelValue => {
            const value = channelValue.toFixed(2);
            const exceedsThreshold = Math.abs(channelValue) > threshold;

            // If threshold is exceeded, mark alert
            if (exceedsThreshold) alertDetected = true;

            rowHTML += `<td>${value}</td>`;
        });

        // Final "Alerts" column
        const overallAlert = alertDetected
            ? `<span style="color: red; font-weight: bold;">❌ Alert</span>`
            : `<span style="color: green;">✅ Normal</span>`;
        rowHTML += `<td>${overallAlert}</td>`;

        row.innerHTML = rowHTML;

        // Scroll into view if auto-follow is enabled
        if (document.getElementById('followTableLive')?.checked) {
            row.scrollIntoView({ behavior: 'smooth' });
        }
    }






    seizureLogContainer.addEventListener('scroll', () => {
        const atBottom = Math.abs(seizureLogContainer.scrollTop + seizureLogContainer.clientHeight - seizureLogContainer.scrollHeight) < 5;
        isLogFollowing = atBottom;
    });

    function detectSeizure(time, eegValue) {
        const entry = document.createElement('div');
        entry.className = 'seizure-entry';
        entry.textContent = `Seizure at ${time}s | EEG: ${eegValue.toFixed(2)}`;
        seizureLogContainer.appendChild(entry);

        if (seizureLogContainer.children.length > 50) {
            seizureLogContainer.removeChild(seizureLogContainer.firstChild);
        }

        if (isLogFollowing) {
            seizureLogContainer.scrollTop = seizureLogContainer.scrollHeight;
        }
    }

    function updateReportPanel() {
        const section = document.querySelector('.live-report') || document.createElement('div');
        section.className = 'live-report';
        if (!document.querySelector('.graph-panel').contains(section)) {
            document.querySelector('.graph-panel').appendChild(section);
        }

        const values = allEEGData.map(d => d.eeg);
        if (!values.length) return;

        const avg = (values.reduce((a, b) => a + b) / values.length).toFixed(2);
        const min = Math.min(...values).toFixed(2);
        const max = Math.max(...values).toFixed(2);

        section.innerHTML = `
            <h3>Live Report</h3>
            <p><strong>Average EEG:</strong> ${avg}</p>
            <p><strong>Min EEG:</strong> ${min}</p>
            <p><strong>Max EEG:</strong> ${max}</p>
        `;
    }

    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);

    function generateReport() {
        document.getElementById('reportLoader').style.display = 'block';
        document.getElementById('reportContent').style.display = 'none';

        const formData = new FormData();
        formData.append('name', document.getElementById('patientName')?.value || 'N/A');
        formData.append('caregiver', document.getElementById('caregiverName')?.value || 'N/A');
        formData.append('contact', document.getElementById('contact')?.value || 'N/A');
        formData.append('issue', document.getElementById('issue')?.value || 'N/A');

        fetch('/generate_report', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                renderTimestamps(data.seizure_times || []);
                document.getElementById('eegImage').src = '/static/eeg_plot.png?v=' + new Date().getTime();
                document.getElementById('downloadReportBtn').style.display = 'inline-block';
                const iframe = document.getElementById('reportFrame');
                iframe.src = '/static/report.pdf?v=' + new Date().getTime();
                document.getElementById('reportLoader').style.display = 'none';
                document.getElementById('reportContent').style.display = 'block';
            } else {
                document.getElementById('reportLoader').style.display = 'none';
                alert(data.error || 'Report generation failed');
            }
        })
        .catch(err => {
            document.getElementById('reportLoader').style.display = 'none';
            alert('Failed: ' + err.message);
        });
    }



    document.getElementById('downloadReportBtn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = '/download_report';  // Make sure this matches your Flask route
        link.download = 'eeg_report.pdf'; // This will hint the browser to download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function renderTimestamps(timestamps) {
        const tbody = document.querySelector('#timestampsTable tbody');
        tbody.innerHTML = "";

        for (let i = 0; i < timestamps.length; i += 4) {
            const row = document.createElement('tr');
            for (let j = 0; j < 4; j++) {
                const index = i + j;
                const cell = document.createElement('td');
                if (index < timestamps.length) {
                    cell.textContent = `${timestamps[index].toFixed(2)}s`;
                } else {
                    cell.textContent = "-";
                }
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }

        document.getElementById('seizureTimestamps').style.display = 'block';
    }


});
document.addEventListener('DOMContentLoaded', () => {
    const saveGraphBtn = document.getElementById('saveGraphButton');

    saveGraphBtn.addEventListener('click', () => {
        if (!chart) {
            alert("Graph is not ready yet.");
            return;
        }

        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = 'eeg_chart.png';
        link.click();
    });
});

document.getElementById('downloadCSV').addEventListener('click', () => {
    if (!allEEGData.length) {
        alert("No EEG data to download.");
        return;
    }

    const csvHeader = "Time (s),EEG Value\n";
    const csvRows = allEEGData.map(d => `${d.time},${d.eeg}`);
    const csvContent = csvHeader + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "eeg_data.csv";
    link.click();
    URL.revokeObjectURL(url);

});


document.getElementById('downloadReportBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = '/download_report';
    link.download = 'report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById("patientFormData").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = {
        patientName: document.getElementById("patientName").value,
        caregiverName: document.getElementById("caregiverName").value,
        contact: document.getElementById("contact").value,
        patientIssue: document.getElementById("patientIssue").value
    };

    fetch("/submit_patient_details", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to submit patient details");
        }
        return response.json();
    })
    .then(data => {
        // alert("Patient details submitted successfully!");
        console.log("Server response:", data);
    })
    .catch(error => {
        console.error("Error submitting patient details:", error);
        alert("Error submitting form. Check console for details.");
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#report-section') {
        const section = document.getElementById('report-section');
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }
});
document.getElementById('createUserBtn').addEventListener('click', function () {
    const form = document.getElementById('patientForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

// Search button behavior (you can customize it to actually search)
document.getElementById('searchBtn').addEventListener('click', function () {
const searchValue = document.getElementById('searchInput').value;
alert(`Search clicked for: ${searchValue}`);
});