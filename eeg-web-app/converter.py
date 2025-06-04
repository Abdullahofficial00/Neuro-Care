import streamlit as st
from moviepy.editor import VideoFileClip
import os
from pathlib import Path
import tempfile

st.title("Video Converter to MP4 (720p)")

uploaded_file = st.file_uploader("Upload a video file", type=["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"])

if uploaded_file is not None:
    st.video(uploaded_file)

    if st.button("Convert to MP4 (720p)"):
        with tempfile.TemporaryDirectory() as temp_dir:
            input_path = os.path.join(temp_dir, uploaded_file.name)
            with open(input_path, "wb") as f:
                f.write(uploaded_file.read())

            try:
                clip = VideoFileClip(input_path)
                clip_resized = clip.resize(height=720)

                output_path = os.path.join(temp_dir, "converted_video.mp4")
                clip_resized.write_videofile(output_path, codec="libx264", audio_codec="aac", preset="medium")

                with open(output_path, "rb") as f:
                    st.success("Conversion successful!")
                    st.download_button("Download MP4 (720p)", f, file_name="converted_720p.mp4")
            except Exception as e:
                st.error(f"Error during conversion: {e}")
