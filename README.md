**NeuroCare – Seizure Detection and EEG Analysis System**

NeuroCare is a web-based platform that supports clinicians and caregivers in detecting and analyzing epileptic seizures using EEG data. The system provides intuitive visualization, automated seizure classification, and downloadable PDF reporting, all within an organized and user-friendly interface.

**🚀 Features**

Upload and manage EEG recordings

Visualize EEG signals from all channels

Predict and classify seizure events with timestamped output

Download comprehensive PDF reports

View real-time graphs and detection results

Manage patient and caregiver data in one place

**📦 Tech Stack**

Frontend: HTML, CSS, JavaScript

Backend: Python (Flask)

Libraries: Matplotlib, NumPy, Pandas, ReportLab, and more

**📄 Complete Hybrid CNN-LSTM Model Code**

[Click the link to Complete Model code repository.](https://github.com/shaheerkhalid989/seizure_detection_model.git)

**🛠️ Setup Instructions**

**1. Clone the Repository**

**Clone the project from GitHub:**

    git clone https://github.com/your-username/NeuroCare.git
    cd NeuroCare

**2. Set Up a Virtual Environment**

Create and activate a virtual environment:

  On macOS/Linux:
    python -m venv venv
    source venv/bin/activate

  On Windows:
    python -m venv venv
    venv\Scripts\activate

**3. Install Required Dependencies**

Install the necessary Python packages:
    pip install -r requirements.txt
**4. Update Configuration (Important)**

Before running the app:

Change the SECURITY_KEY in the backend (e.g., in app.py or config.py)

Update any hardcoded database URIs, file paths, or tokens used in Flask routes

In the frontend, also update:

API URIs (if changed)

Any keys or tokens used for frontend-backend communication

⚠️ Never commit your actual keys or URIs to the repository.
Use environment variables or a .env file and load them securely.

**5. Run the Application**

Start the Flask app:
    python app.py
Open your browser and navigate to:
    http://127.0.0.1:5000/
**📂 Folder Structure**

NeuroCare/
├── static/
│   ├── eeg/
│   ├── css/
│   └── report.pdf
├── templates/
│   └── index.html
├── app.py
├── requirements.txt
└── README.md

**📄 License**

This project is open-source and available under the MIT License.

👨‍⚕️ Built with purpose — to support epilepsy diagnosis and improve patient care.
