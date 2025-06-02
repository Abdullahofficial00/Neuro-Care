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
        streamSource.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data?.eeg && data?.time) processEEGData(data);
        };
        streamSource.onerror = () => streamSource.close();
    }

    

    function initChart() {
        if (chart) return;
        chart = new Chart(eegChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'EEG Signal',
                    data: [],
                    borderColor: '#e63946',
                    pointRadius: 0,
                    tension: 0.1
                }]
            },
            options: {
                animation: false,
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
                plugins: { legend: { display: false } }
            }
        });

        // Scroll to move window
        document.getElementById('graph').parentElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const latest = allEEGData.at(-1)?.time || 0;
            const maxStart = Math.max(0, latest - viewWindowSize);
            windowStart += (e.deltaY > 0 ? 1 : -1) * 5;
            windowStart = Math.max(0, Math.min(windowStart, maxStart));
            userIsFollowing = false;
            updateChartWindow();
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
    let inSeizure = false;
    function processEEGData({ time, eeg }) {
        initChart();
        const lastTime = time.at(-1);
        const lastEEG = eeg.at(-1);

        allEEGData.push({ time: lastTime, eeg: lastEEG });
        chart.data.labels.push(lastTime);
        chart.data.datasets[0].data.push({ x: lastTime, y: lastEEG });

        const maxY = Math.max(...chart.data.datasets[0].data.map(d => Math.abs(d.y)));
        chart.options.scales.y.min = -maxY;
        chart.options.scales.y.max = maxY;

        if (userIsFollowing && lastTime > windowStart + viewWindowSize) {
            windowStart = lastTime - viewWindowSize;
        }
        updateChartWindow();

        updateEEGTable(lastTime, lastEEG);
        updateReportPanel();

        if (Math.abs(lastEEG) > seizureThreshold) {
            if (!inSeizure) {
                detectSeizure(lastTime, lastEEG);
                inSeizure = true;
            }
        } else {
            inSeizure = false;
        }
    }

    function updateEEGTable(time, eeg) {
        const tbody = eegTable.querySelector('tbody');
        const row = tbody.insertRow();
        row.innerHTML = `<td>${time}</td><td>${eeg.toFixed(2)}</td><td>${eeg > 30 ? 'High EEG' : ''}</td>`;

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