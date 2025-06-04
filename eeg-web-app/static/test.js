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
        if (!file) {
            alert('No file selected');
            return;
        }

        // Optional: Validate file extension before uploading
        if (!file.name.toLowerCase().endsWith('.edf')) {
            alert('Only .edf files are allowed.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', { method: 'POST', body: formData })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.message === 'File uploaded successfully.') {
                    resetChart();
                    allEEGData = [];
                    startEEGStream();
                    generateReport();
                    updateReportPanel();

                } else {
                    alert(data.error || 'Upload failed');
                }
            })
            .catch(err => {
                alert('Upload error: ' + err.message);
            });
    });


    function handleFileUploadSuccess() {
        const panel = document.getElementById("reportPanel");
        const button = document.getElementById("generateAIReportBtn");

        if (panel) panel.style.display = "block";
        if (button) button.style.display = "inline-block";
    }


    // On logout (optional)
    function logout() {
    localStorage.removeItem('doctorData');
    window.location.href = 'login.html';
    }

    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            doctorID: document.getElementById('doctorID').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            contact: document.getElementById('contact').value,
            hospital: document.getElementById('hospital').value,
            age: document.getElementById('age').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        };

        const response = await fetch('http://localhost:5000/api/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        alert(result.message);
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
        // Show loader and hide report content
        const loader = document.getElementById('reportLoader');
        const reportContent = document.getElementById('reportContent');
        if (loader) loader.style.display = 'block';
        if (reportContent) reportContent.style.display = 'none';

        // Collect form data
        const formData = new FormData();
        formData.append('name', document.getElementById('patientName')?.value || 'N/A');
        formData.append('caregiver', document.getElementById('caregiverName')?.value || 'N/A');
        formData.append('contact', document.getElementById('contact')?.value || 'N/A');
        formData.append('issue', document.getElementById('issue')?.value || 'N/A');

        // Send request to backend
        fetch('/generate_report', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Server error: ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            if (loader) loader.style.display = 'none';

            if (data.message) {
                // Render timestamps
                renderTimestamps(data.seizure_times || []);

                // Render EEG images
                const eegImageContainer = document.getElementById('eegImages');
                if (eegImageContainer) {
                    eegImageContainer.innerHTML = '';
                    if (Array.isArray(data.eeg_images) && data.eeg_images.length > 0) {
                        data.eeg_images.forEach((src, index) => {
                            if (src) {
                                const img = document.createElement('img');
                                img.src = src + '?v=' + new Date().getTime();
                                img.alt = `EEG Channel ${index + 1}`;
                                img.style.width = '100%';
                                img.style.marginBottom = '10px';
                                eegImageContainer.appendChild(img);
                            }
                        });
                    } else {
                        eegImageContainer.innerHTML = '<p>No EEG images found.</p>';
                    }
                }

                // Show prediction image
                const predictionImage = document.getElementById('eegImage');
                const predictionDiv = document.getElementById('prediction');
                if (predictionImage && predictionDiv) {
                    predictionImage.src = '/static/prediction_graph.png?v=' + new Date().getTime();
                    predictionDiv.style.display = 'block';
                }

                // Load PDF report
                const reportFrame = document.getElementById('reportFrame');
                const downloadBtn = document.getElementById('downloadReportBtn');
                if (reportFrame) {
                    reportFrame.src = '/static/report.pdf?v=' + new Date().getTime();
                }
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-block';
                }
                if (reportContent) {
                    reportContent.style.display = 'block';
                }

            } else {
                alert(data.error || 'Report generation failed');
            }
        })
        .catch(err => {
            if (loader) loader.style.display = 'none';
            alert('Failed: ' + err.message);
        });
    }



    // Static EEG Gallery for channelreport images
    document.addEventListener('DOMContentLoaded', () => {
        const images = [
            '/static/eeg_channel_1.png',
            '/static/eeg_channel_2.png',
            '/static/eeg_channel_3.png',
            '/static/eeg_channel_4.png',
            '/static/eeg_channel_5.png',
            '/static/eeg_channel_6.png',
            '/static/eeg_channel_7.png',
            '/static/eeg_channel_8.png',
            '/static/eeg_channel_9.png',
            '/static/eeg_channel_10.png',
            '/static/eeg_channel_11.png',
            '/static/eeg_channel_12.png',
            '/static/eeg_channel_13.png',
            '/static/eeg_channel_14.png',
            '/static/eeg_channel_15.png',
            '/static/eeg_channel_16.png',
            '/static/eeg_channel_17.png',
            '/static/eeg_channel_18.png',
            '/static/eeg_channel_19.png',
            '/static/prediction_graph.png'
        ];

        const container = document.getElementById('eegImages');
        container.innerHTML = ''; // Clear any existing content

        let currentIndex = 0;

        // Create navigation buttons and image element
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.style.marginRight = '20px';

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.style.marginLeft = '20px';

        const img = document.createElement('img');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '400px';
        img.style.display = 'block';
        img.style.margin = '20px auto';

        // Wrapper to align buttons and image
        const galleryFrame = document.createElement('div');
        galleryFrame.style.display = 'flex';
        galleryFrame.style.flexDirection = 'column';
        galleryFrame.style.alignItems = 'center';

        // Buttons wrapper
        const buttonRow = document.createElement('div');
        buttonRow.appendChild(prevBtn);
        buttonRow.appendChild(nextBtn);

        // Append everything
        galleryFrame.appendChild(img);
        galleryFrame.appendChild(buttonRow);
        container.appendChild(galleryFrame);

        // Load image
        function showImage(index) {
            img.src = images[index] + '?v=' + new Date().getTime(); // Force fresh load
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });

        // Show first image initially
        showImage(currentIndex);
    });

    document.getElementById('downloadReportBtn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = '/download_report';  // Make sure this matches your Flask route
        link.download = 'eeg_report.pdf'; // This will hint the browser to download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function renderTimestamps(timestamps = []) {
        const tableBody = document.querySelector('#timestampsTable tbody');
        tableBody.innerHTML = ''; // Clear previous rows

        if (timestamps.length === 0) {
            const row = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 2;
            td.textContent = 'No seizure timestamps available.';
            row.appendChild(td);
            tableBody.appendChild(row);
            return;
        }

        timestamps.forEach((item) => {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            const typeCell = document.createElement('td');

            timeCell.textContent = item.time || 'N/A';
            typeCell.textContent = item.classification || 'Unknown';

            row.appendChild(timeCell);
            row.appendChild(typeCell);
            tableBody.appendChild(row);
        });
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
    const table = document.getElementById('eegTable');
    const rows = Array.from(table.querySelectorAll('tr'));
    const csvContent = rows.map(row => {
        const cols = Array.from(row.querySelectorAll('th, td'));
        return cols.map(col => `"${col.textContent.trim()}"`).join(',');
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `EEG_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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




document.getElementById('generateAIReportBtn').addEventListener('click', () => {
    console.log("Button clicked");
    return alert("pressed");
});

document.addEventListener("DOMContentLoaded", function () {
    const generateBtn = document.getElementById('generateAIReportBtn');

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateReport();
            updateReportPanel();
            const username = localStorage.getItem('username');
            if (!username) return alert("No user found in localStorage");

            fetch('/check_subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'active') {
                    generateReport();
                } else {
                    document.getElementById('subscriptionPlans').style.display = 'block';
                }
            })
            .catch(err => {
                console.error("Fetch failed:", err);
            });
        });
    }

    window.subscribe = function(plan) {
        const username = localStorage.getItem('username');
        fetch('/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, plan })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert(`Subscription activated until ${data.end}`);
                document.getElementById('subscriptionPlans').style.display = 'none';
                generateReport();
            }
        });
    };
});
function subscribe(plan) {
    const username = localStorage.getItem('username');

    fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, plan })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            alert(`Subscription activated until ${data.end}`);
            document.getElementById('subscriptionPlans').style.display = 'none';
            generateReport(); // Run after subscription
        }
    });
}
