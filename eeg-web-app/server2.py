import os
import requests
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
import base64
import re
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import bcrypt
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

    
# Secret key for session management (you should use a stronger secret key in production)
app.secret_key = os.getenv("SECRET_KEY", "dev_secret_key")
STATIC_FOLDER = os.path.join(os.getcwd(), 'static') 

# MongoDB Connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['NeuroCare']
doctors_collection = db['doctors']

# Load the pre-trained model
model = tf.keras.models.load_model('best_model.keras')

# Path to store uploaded files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

uploaded_file_path = None

# Home route (redirect to login page)
@app.route('/')
def home():
    doctor = {"name": "Doctor"}  # Replace with your actual data or logic
    return render_template('index.html', doctor=doctor)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        doctor = doctors_collection.find_one({'username': username})

        if doctor and bcrypt.checkpw(password.encode('utf-8'), doctor['password']):
            return render_template('index.html', username=username)
        else:
            flash("Invalid username or password", "danger")

    return render_template('login.html')
@app.route('/index')
def index():
    username = request.args.get('username')
    if not username:
        flash("Unauthorized access", "danger")
        return redirect(url_for('login'))
    

    return render_template('index.html', username=username)

# Signup route
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Removed doctor_id input here
        name = request.form['name']
        email = request.form['email']
        contact = request.form['contact']
        hospital = request.form['hospital']
        age = request.form['age']
        username = request.form['username']
        password = request.form['password']

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create doctor record without doctor_id
        doctor_data = {
            'name': name,
            'email': email,
            'contact': contact,
            'hospital': hospital,
            'age': age,
            'username': username,
            'password': hashed_password,
            'card_number': None,
            'cvv': None,
            'exp_date': None,
            'subscription': None,
            'sub_start': None,
            'sub_end': None
        }

        # Check if username/email already exists
        if doctors_collection.find_one({'username': username}):
            flash('Username already exists', 'danger')
            return render_template('signup.html')

        # Save to MongoDB
        doctors_collection.insert_one(doctor_data)
        flash('Signup successful! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('signup.html')


# Dashboard route
@app.route('/dashboard')
def dashboard():
    return render_template('index.html')


# Edit doctor route
@app.route('/edit/<id>', methods=['GET', 'POST'])
def edit_doctor(id):
    doctor = doctors_collection.find_one({'_id': ObjectId(id)})

    if request.method == 'POST':
        updated = {
            # Removed doctor_id here too
            'name': request.form['name'],
            'email': request.form['email'],
            'contact': request.form['contact'],
            'hospital': request.form['hospital'],
            'age': request.form['age'],
            'card_number': request.form['card_number'],
            'cvv': request.form['cvv'],
            'exp_date': request.form['exp_date'],
            'subscription': request.form['subscription'],
            'sub_start': request.form['sub_start'],
            'sub_end': request.form['sub_end']
        }
        doctors_collection.update_one({'_id': ObjectId(id)}, {'$set': updated})
        flash("Doctor updated successfully!", "success")
        return redirect(url_for('dashboard'))

    return render_template('edit_doctor.html', doctor=doctor)


# Delete doctor route
@app.route('/delete/<id>')
def delete_doctor(id):
    doctors_collection.delete_one({'_id': ObjectId(id)})
    flash("Doctor deleted", "info")
    return redirect(url_for('dashboard'))


# Logout route
@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out successfully", "info")
    return redirect(url_for('login'))


@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_file_path
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.lower().endswith('.edf'):
        return jsonify({"error": "Invalid file format. Only .edf files are allowed."}), 400
    
    uploaded_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(uploaded_file_path)
    
    return jsonify({"message": "File uploaded successfully."}), 200

@app.route('/submit_patient_details', methods=['POST'])
def submit_patient_details():
    data = request.get_json()
    session['patient_data'] = data
    return jsonify({'status': 'success'})


# Time formatting helper
def format_seconds(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    total_secs = hours * 3600 + minutes * 60 + secs
    return total_secs

@app.route('/check_subscription', methods=['POST'])
def check_subscription():
    data = request.get_json()
    username = data.get('username')
    # logic to check subscription status
    return jsonify({'status': 'active'})  # or 'inactive'



@app.route('/subscribe', methods=['POST'])
def subscribe():
    username = request.json.get('username')
    plan = request.json.get('plan')  # 'week', 'month', 'year'

    doctor = doctors_collection.find_one({'username': username})
    if not doctor:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404

    today = datetime.today().date()

    durations = {
        'week': timedelta(weeks=1),
        'month': timedelta(days=30),
        'year': timedelta(days=365)
    }

    if plan not in durations:
        return jsonify({'status': 'error', 'message': 'Invalid plan'}), 400

    start_date = today
    end_date = today + durations[plan]

    doctors_collection.update_one(
        {'username': username},
        {'$set': {
            'subscription_start': start_date,
            'subscription_end': end_date
        }}
    )

    return jsonify({'status': 'success', 'start': str(start_date), 'end': str(end_date)})
    

@app.route('/generate_report', methods=['POST'])
def generate_report():
    global uploaded_file_path
    if not uploaded_file_path or not os.path.exists(uploaded_file_path):
        return jsonify({"error": "No file uploaded"}), 400

    try:
        # Step 1: Copy uploaded file to static folder
        copied_file_path = os.path.join('static', 'temp_file.edf')
        shutil.copy(uploaded_file_path, copied_file_path)

        # Step 2: Read EDF file
        with pyedflib.EdfReader(copied_file_path) as f:
            sample_rate = f.getSampleFrequency(0)
            total_samples = f.getNSamples()[0]
            signals = np.array([f.readSignal(i) for i in range(19)]).T

            # Step 3: Windowing
            window_size = 1024
            num_windows = signals.shape[0] // window_size
            signals = signals[:num_windows * window_size]
            windows = signals.reshape((num_windows, window_size, 19))

            # Step 4: Predictions
            predictions = model.predict(windows)[:, 0]  # Make sure model is defined and loaded
            eeg_signal = signals[:, 0]
            time_values = np.arange(len(eeg_signal)) / sample_rate

        # Calculate seizure times
        window_time_values = np.arange(num_windows) * window_size / sample_rate
        seizure_times = []
        for i, p in enumerate(predictions):
            if p > 0.5:
                seizure_time = window_time_values[i]
                formatted_time = f"{format_seconds(seizure_time)}s"
                seizure_type = "Generalized" if p > 0.85 else "Focal"
                seizure_times.append({
                    "time": formatted_time,
                    "classification": seizure_type
                })

        # Step 5: Generate EEG channel images
        eeg_image_paths = []
        for i in range(19):
            eeg_img_path = f"static/eeg_channel_{i+1}.png"
            plt.figure(figsize=(8, 2))
            plt.plot(signals[:, i])
            plt.title(f"EEG Channel {i + 1}")
            plt.xlabel("Samples")
            plt.ylabel("Amplitude")
            plt.tight_layout()
            plt.savefig(eeg_img_path)
            plt.close()
            eeg_image_paths.append(eeg_img_path)

        # Step 6: Combined EEG and Prediction Plot
        prediction_image_path = "static/prediction_graph.png"
        plt.figure(figsize=(10, 6))

        # Plot EEG Signal
        plt.subplot(2, 1, 1)
        plt.plot(time_values, eeg_signal, label='EEG Signal')
        for idx, pred in enumerate(predictions):
            if pred > 0.5:
                seizure_time = time_values[idx * window_size]
                seizure_val = eeg_signal[idx * window_size]
                plt.plot(seizure_time, seizure_val, 'ro')
                plt.annotate('',
                            xy=(seizure_time, seizure_val),
                            xytext=(seizure_time + 0.5, seizure_val + 20),
                            arrowprops=dict(facecolor='red', arrowstyle='->'))
        plt.xlabel('Time (s)')
        plt.ylabel('EEG Value')
        plt.title('EEG Signal')
        plt.legend()

        # Plot Predictions
        plt.subplot(2, 1, 2)
        plt.plot(np.linspace(0, time_values[-1], len(predictions)), predictions, label='Model Prediction', color='red')
        plt.xlabel('Time (s)')
        plt.ylabel('Prediction')
        plt.title('Seizure Detection Prediction')
        plt.legend()

        plt.tight_layout()
        plt.savefig(prediction_image_path)
        plt.close()

        # Step 7: Generate PDF Report
        pdf_path = "static/report.pdf"
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        elements = []

        # Styles
        styles = getSampleStyleSheet()
        heading_style = ParagraphStyle(name="HeadingStyle", fontName="Helvetica-Bold", fontSize=20, alignment=1)
        body_style = styles['Normal']
        body_style.fontSize = 12

        # Title
        elements.append(Paragraph("<strong>NeuroCare Seizure Detection Report</strong>", heading_style))
        elements.append(Spacer(1, 12))

        # Patient Info
        patient_name = request.form.get('patientName', 'N/A')
        caregiver_name = request.form.get('caregiverName', 'N/A')
        contact = request.form.get('contact', 'N/A')
        patient_issue = request.form.get('patientIssue', 'N/A')
        
        copied_file_path = os.path.join('static', 'temp_file.edf')
        shutil.copy(uploaded_file_path, copied_file_path)

        patient_info_data = [
            ['Name: ' + patient_name, 'Caregiver Name: ' + caregiver_name],
            ['Contact: ' + contact, 'Patient Issue: ' + patient_issue]
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
        elements.append(patient_info_table)
        elements.append(Spacer(1, 12))

        # Seizure Times Table
        data = [['Timestamp', 'Classification']]
        for entry in seizure_times:
            data.append([entry["time"], entry["classification"]])

        table = Table(data, colWidths=[200, 200], rowHeights=20)
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

        # Prediction Graph
        elements.append(Paragraph("<strong>EEG Signal and Seizure Prediction</strong>", body_style))
        elements.append(Spacer(1, 6))
        img = Image(prediction_image_path, width=400, height=300)
        elements.append(img)
        elements.append(Spacer(1, 12))

        # Add all individual EEG channel graphs to PDF
        elements.append(Paragraph("<strong>Individual EEG Channel Graphs</strong>", body_style))
        elements.append(Spacer(1, 12))
        for img_path in eeg_image_paths:
            img = Image(img_path, width=400, height=100)  # Adjust size as needed
            elements.append(img)
            elements.append(Spacer(1, 12))

        # Placeholder for Prescription
        elements.append(Paragraph("<strong>Prescription:</strong>", body_style))
        elements.append(Spacer(1, 12))

        # Footer
        elements.append(Paragraph("<strong>Report Generated By:</strong> NeuroCare AI System", body_style))

        doc.build(elements)

        return jsonify({
            "message": "Report generated successfully.",
            "seizure_times": seizure_times,
            "report_url": pdf_path,
            "eeg_images": eeg_image_paths,
            "prediction_image": f"/{prediction_image_path}"
        })

    except Exception as e:  
        print(f"Error generating report: {e}")
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
        return

    try:
        with pyedflib.EdfReader(uploaded_file_path) as f:
            num_channels = 19
            sample_rate = f.getSampleFrequency(0)
            total_samples = f.getNSamples()[0]

            # Read signals for all 19 channels
            signals = [f.readSignal(i) for i in range(num_channels)]
            print("Streaming EEG data from 19 channels...")

            chunk_size = 100
            for start in range(0, total_samples, chunk_size):   
                end = min(start + chunk_size, total_samples)
                time_values = (np.arange(start, end) / sample_rate).tolist()

                # Slice each channel's chunk
                eeg_chunks = [
                    signal[start:end].tolist() for signal in signals
                ]

                # Basic seizure detection: If any channel has extreme values
                seizure_detected = any(
                    abs(value) > 500
                    for channel_chunk in eeg_chunks
                    for value in channel_chunk
                )

                data_to_send = {
                    'time': time_values,
                    'eeg': eeg_chunks,  # List of 19 channel chunks
                    'seizure': seizure_detected
                }
                yield f"data: {json.dumps(data_to_send)}\n\n"
                time.sleep(0.1)

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

@app.route('/save_graph', methods=['POST'])
def save_graph():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image data received'}), 400

    image_data = data['image']
    image_data = re.sub('^data:image/.+;base64,', '', image_data)

    try:
        with open('static/saved_graph.png', 'wb') as f:
            f.write(base64.b64decode(image_data))
        print("✅ Graph image saved as static/saved_graph.png")
        return '', 204
    except Exception as e:
        print("Error saving graph:", e)
        return jsonify({'error': 'Failed to save image'}), 500

if __name__ == '__main__':
    app.run(debug=True)
