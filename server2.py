import os
import numpy as np
import pyedflib
import time
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, Response, jsonify, send_file, session
import tensorflow as tf
from tensorflow.keras.models import load_model
import json
import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
import shutil

app = Flask(__name__)

# Secret key for session management (you should use a stronger secret key in production)
app.secret_key = '12345'
STATIC_FOLDER = os.path.join(os.getcwd(), 'static') 
# Load the pre-trained model
model = tf.keras.models.load_model('best_model.keras')

# Dummy username and password for login (replace with a database check)
users = {
    'user1': 'password123',
    'user2': 'mypassword'
}

# Path to store uploaded files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

uploaded_file_path = ""

# Home route (redirect to login page)
@app.route('/')
def home():
    return redirect(url_for('login'))

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if the username and password match
        if username in users and users[username] == password:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('index'))  # Redirect to the main page after successful login
        else:
            flash('Invalid username or password', 'danger')
            return render_template('login.html')  # Stay on login page if login fails
    
    # If GET request, display login page
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Add your signup logic here (e.g., save the user to a database)
        username = request.form['username']
        password = request.form['password']
        # Perform validation, save user data, etc.
        flash("Sign up successful!")
        return redirect(url_for('login'))
    return render_template('signup.html')


# Logout route
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    return redirect(url_for('login'))  # Redirect back to the login page after logout

# Index route (main page) - only accessible after login
@app.route('/index')
def index():
    if 'logged_in' not in session:
        return redirect(url_for('login'))  # Redirect to login if not logged in
    return render_template('test.html')

# Upload route
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'logged_in' not in session:
        return redirect(url_for('login'))  # Redirect to login if not logged in

    global uploaded_file_path
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Validate file type (only allow .edf files)
    if not file.filename.lower().endswith('.edf'):
        return jsonify({"error": "Invalid file format. Only .edf files are allowed."}), 400
    
    uploaded_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(uploaded_file_path)
    
    return jsonify({"message": "File uploaded successfully."})

# Generate report route
# Generate report route
@app.route('/generate_report', methods=['GET'])
def generate_report():
    if 'logged_in' not in session:
        return redirect(url_for('login'))  # Redirect to login if not logged in

    if not uploaded_file_path:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        # Generate a copy of the uploaded file
        copied_file_path = os.path.join('static', 'temp_file.edf')
        shutil.copy(uploaded_file_path, copied_file_path)  # Create a copy in the static folder

        # Now use this copied file (not the original uploaded one) for processing
        with pyedflib.EdfReader(copied_file_path) as f:
            sample_rate = f.getSampleFrequency(0)
            total_samples = f.getNSamples()[0]

            # Read all 19 channels
            signals = np.array([f.readSignal(i) for i in range(19)])  # (19, total_samples)
            signals = signals.T  # (total_samples, 19)

            # Cut into windows
            window_size = 1024
            num_windows = signals.shape[0] // window_size
            signals = signals[:num_windows * window_size]  # trim extra samples
            windows = signals.reshape((num_windows, window_size, 19))  # (num_windows, 1024, 19)

            # Model Prediction
            predictions = model.predict(windows)[:, 0]  # (num_windows,)

            # For plotting, use first EEG channel
            eeg_signal = signals[:, 0]
            time_values = np.arange(len(eeg_signal)) / sample_rate

        # Create an array of time stamps for the seizure detection
        window_time_values = np.arange(num_windows) * window_size / sample_rate  # Time for each window

        # Ensure seizure timestamps are aligned with predictions
        seizure_times = window_time_values[predictions > 0.5]  # Example threshold for seizure detection

        # Convert seizure_times to a list
        seizure_times = seizure_times.tolist()

        # --- Report Generation (Before Plotting) ---
        pdf_path = "static/report.pdf"
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        elements = []

        # Define custom styles
        styles = getSampleStyleSheet()
        heading_style = ParagraphStyle(name="HeadingStyle", fontName="Helvetica-Bold", fontSize=20, alignment=1, textColor=colors.black)
        body_style = styles['Normal']
        body_style.fontSize = 12
        body_style.textColor = colors.black

        # Title
        elements.append(Paragraph("<strong>NeuroCare Seizure Detection Report</strong>", heading_style))
        elements.append(Spacer(1, 12))

        # Get patient data from session
        patient_data = session.get('patient_data', {})
        patient_name = patient_data.get('name', 'N/A')
        caregiver_name = patient_data.get('caregiver_name', 'N/A')
        contact = patient_data.get('caregiver_phone', 'N/A')  # Using caregiver phone as contact
        issue = patient_data.get('patient_issue', 'N/A')

        # Patient Information Block (2x2 Table)
        patient_info_data = [
            ['Name: ' + patient_name, 'Caregiver Name: ' + caregiver_name],
            ['Contact: ' + contact, 'Patient Issue: ' + issue]
        ]

        patient_info_table = Table(patient_info_data, colWidths=[150, 300], rowHeights=30)
        patient_info_table.setStyle(TableStyle([ 
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))

        # Add the patient_info_table directly to elements
        elements.append(patient_info_table)
        elements.append(Spacer(1, 12))

        # Seizure timestamps table (4 columns)
        data = [['Timestamp 1', 'Timestamp 2', 'Timestamp 3', 'Timestamp 4']]  # Header row
        for i in range(0, len(seizure_times), 4):
            row = seizure_times[i:i + 4]  # Add rows of 4 timestamps
            row.extend([''] * (4 - len(row)))  # Ensure all rows have 4 columns
            data.append(row)

        # Create table
        table = Table(data, colWidths=[100, 100, 100, 100], rowHeights=20)
        table.setStyle(TableStyle([ 
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 12))

        # --- Graph Plot (After Report Generation) ---
        plot_path = "static/eeg_plot.png"
        plt.figure(figsize=(10, 6))

        plt.subplot(2, 1, 1)
        plt.plot(time_values, eeg_signal, label='EEG Signal')
        plt.xlabel('Time (s)')
        plt.ylabel('EEG Value')
        plt.title('EEG Signal')
        plt.legend()

        plt.subplot(2, 1, 2)
        plt.plot(np.linspace(0, time_values[-1], len(predictions)), predictions, label='Model Prediction', color='red')
        plt.xlabel('Time (s)')
        plt.ylabel('Prediction')
        plt.title('Seizure Detection Prediction')
        plt.legend()

        plt.tight_layout()
        plt.savefig(plot_path)  # Save the plot as an image
        plt.close()  # Important to avoid memory leaks

        # Add plot image to PDF report
        elements.append(Paragraph("<strong>EEG Signal and Seizure Prediction</strong>", body_style))
        elements.append(Spacer(1, 6))
        img = Image(plot_path, width=400, height=300)
        elements.append(img)
        elements.append(Spacer(1, 12))

        # Add prescription
        elements.append(Paragraph("<strong>Prescription</strong>", body_style))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph("To be filled by the doctor.", body_style))

        # Build the PDF
        doc.build(elements)

        # Return the timestamps as JSON for frontend use
        return jsonify({
            "message": "Report generated successfully",
            "pdf_path": pdf_path,
            "seizure_times": seizure_times
        })

    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500



@app.route('/upload_patient_data', methods=['POST'])
def upload_patient_data():
    try:
        # Get patient details from the request body (assuming JSON)
        patient_data = request.get_json()

        patient_name = patient_data.get('name', 'N/A')
        caregiver_name = patient_data.get('caregiver_name', 'N/A')
        caregiver_phone = patient_data.get('caregiver_phone', 'N/A')
        patient_age = patient_data.get('patient_age', 'N/A')
        patient_issue = patient_data.get('patient_issue', 'N/A')

        # Store patient data in session (or any other required place)
        session['patient_data'] = {
            'name': patient_name,
            'caregiver_name': caregiver_name,
            'caregiver_phone': caregiver_phone,
            'patient_age': patient_age,
            'patient_issue': patient_issue
        }

        return jsonify({"message": "Patient data uploaded successfully."}), 200

    except Exception as e:
        return jsonify({"error": f"Error uploading patient data: {str(e)}"}), 500

# Stream EEG data as JSON
def generate_eeg_stream():
    global uploaded_file_path

    if not uploaded_file_path:
        yield 'data: {"error": "No file uploaded"}\n\n'
        return  # Stop further execution

    try:
        with pyedflib.EdfReader(uploaded_file_path) as f:
            sample_rate = f.getSampleFrequency(0)
            total_samples = f.getNSamples()[0]
            signal = f.readSignal(0)
            print("Streaming EEG data...")
            chunk_size = 100  # Small chunks for smooth animation
            for start in range(0, total_samples, chunk_size):
                end = min(start + chunk_size, total_samples)
                eeg_chunk = signal[start:end]
                time_values = (np.arange(start, end) / sample_rate).tolist()
                eeg_chunk = eeg_chunk.tolist()

                # Example basic seizure detection
                seizure_detected = any(abs(x) > 500 for x in eeg_chunk)

                data_to_send = {
                    'time': time_values,
                    'eeg': eeg_chunk,
                    'seizure': seizure_detected
                }
                yield f"data: {json.dumps(data_to_send)}\n\n"

                time.sleep(0.1)  # Optional: Simulate a delay for real-time streaming
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.route('/stream')
def stream():
    return Response(generate_eeg_stream(), mimetype='text/event-stream')

# Download Report Route
@app.route('/download_report', methods=['GET'])
def download_report():
    try:
        report_path = os.path.join(STATIC_FOLDER, "report.pdf")
        if os.path.exists(report_path):
            return send_file(report_path, as_attachment=True)
        else:
            return jsonify({"error": "Report not found. Please generate the report first."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
