from flask import Flask, make_response, request, redirect, render_template
from PyPDF2 import PdfFileReader
import pdf_utils
import os

app = Flask(__name__)

flask_dir = os.path.dirname(__file__)
pdf_dir= os.path.join(flask_dir,'static','pdf')

@app.route('/')
def index_html():
    return render_template('index.html',
            template_folder=os.path.join(flask_dir,'templates'),
            static_folder=os.path.join(flask_dir,'static'))

@app.route('/upload', methods=['POST'])
def save_file():
    uploaded_file = request.files['file']
    refresh(uploaded_file.filename)

    upload_path = pdf_dir + '/' + uploaded_file.filename
    uploaded_file.save(upload_path)   

    response = make_response()
    if(PdfFileReader(upload_path).isEncrypted):        
        response.data = "暗号化されています"
        response.mimetype = "text/plain"
        refresh(uploaded_file.filename)    
    else:
        try:
            pdf_utils.Make_Thumb(upload_path, pdf_dir + '/thumb_' + uploaded_file.filename)
            pdf_utils.Make_Booklet(upload_path, pdf_dir + '/booklet_' + uploaded_file.filename)
            
                #PDFの1ページ目をサムネイルとして送りかえす
            response.data = open(pdf_dir + '/thumb_' + uploaded_file.filename,"rb").read()
            response.mimetype = "application/pdf"
        except:
            response.data = "エラー"
            response.mimetype = "text/plain"
            refresh(uploaded_file.filename) 

    return response

@app.route('/download', methods=['POST'])
def send_booklet():
    filename = request.form['filename']
    
    response = make_response()
    response.data = open(pdf_dir + '/booklet_' + filename,"rb").read()
    response.mimetype = "application/pdf"

    return response

@app.route('/refresh',methods=['POST'])
def refresh_file():
    filename = request.form['filename']
    refresh(filename)

    return redirect("/")

def refresh(filename):
    if(os.path.isfile(pdf_dir + '/' + filename)): os.remove(pdf_dir + '/' + filename)
    if(os.path.isfile(pdf_dir + '/thumb_' + filename)): os.remove(pdf_dir + '/thumb_' + filename)    
    if(os.path.isfile(pdf_dir + '/booklet_' + filename)): os.remove(pdf_dir + '/booklet_' + filename)
    return
    
if __name__ == '__main__':
    print(pdf_dir)
    app.run(debug=True)