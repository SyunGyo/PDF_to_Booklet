from PyPDF2 import PdfFileReader, PdfFileWriter, pdf
import os

def Make_Booklet(pdf_path,output_path):
    pdf_reader = PdfFileReader(pdf_path)
    pdf_writer = PdfFileWriter()
    pdf_writer.appendPagesFromReader(pdf_reader)

    #ページ数が4の倍数になるように調整
    Num_addPages = 4 - (pdf_reader.numPages % 4)
    if Num_addPages != 4:
        for i in range(int(Num_addPages)):
            pdf_writer.addBlankPage()
    
    Num_Pages = pdf_writer.getNumPages() 
    width = 2 * pdf_writer.getPage(1).mediaBox.getUpperRight_x()
    height = pdf_writer.getPage(1).mediaBox.getUpperRight_y()
    booklet = PdfFileWriter()
    
    #小冊子形式のPDFのページをbookletに書き加えていく   
    for i in range(Num_Pages // 4):

        newPage_odd = pdf.PageObject.createBlankPage(width=width, height=height)
        newPage_odd.mergePage(pdf_writer.getPage(Num_Pages - 2 * i - 1))
        newPage_odd.mergeTranslatedPage(pdf_writer.getPage(2 * i), width/2 ,0)
        booklet.addPage(newPage_odd)

        newPage_even = pdf.PageObject.createBlankPage(width=width, height=height)
        newPage_even.mergePage(pdf_writer.getPage(2 * i + 1))
        newPage_even.mergeTranslatedPage(pdf_writer.getPage(Num_Pages - 2 * i - 2), width/2 ,0)
        booklet.addPage(newPage_even)
        
    if(os.path.isfile(output_path)):
        os.remove(output_path)

    with open(output_path, 'wb') as fh:
        booklet.write(fh)

def Make_Thumb(pdf_path,Thumb_path):
    pdf_reader = PdfFileReader(pdf_path)
    pdf_writer = PdfFileWriter()
    pdf_writer.addPage(pdf_reader.getPage(0))

    with open(Thumb_path,'wb') as fh:
        pdf_writer.write(fh)

if __name__ == "__main__":
    Make_Booklet("./sample.pdf","./sample_booklet.pdf")
    
