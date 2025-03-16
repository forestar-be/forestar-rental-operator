import { Component } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

const workerSrc = `${window.location.origin}/pdf.worker.mjs`;
GlobalWorkerOptions.workerSrc = workerSrc;

class PDFtoIMG extends Component {
  state = {
    pages: [],
    error: null,
  };

  componentDidMount() {
    if (!this.props.file || !(this.props.file instanceof Blob)) {
      console.error('Invalid file provided:', this.props.file);
      this.setState({ error: 'Invalid file provided' });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.props.file);

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      this.setState({ error: 'Failed to read file' });
    };

    reader.onloadend = () => {
      console.log('File loaded as data URL');

      getDocument(reader.result)
        .promise.then((pdf) => {
          console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
          this.pdf = pdf;

          const pagePromises = [];
          for (let i = 0; i < this.pdf.numPages; i++) {
            pagePromises.push(this.getPage(i + 1));
          }

          return Promise.all(pagePromises);
        })
        .then((pages) => {
          console.log('All pages rendered:', pages.length);
          this.setState({ pages });
        })
        .catch((error) => {
          console.error('Error processing PDF:', error);
          this.setState({ error: 'Failed to process PDF' });
        });
    };
  }

  getPage = (num) => {
    return new Promise((resolve, reject) => {
      this.pdf
        .getPage(num)
        .then((page) => {
          console.log(`Rendering page ${num}`);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const canvasContext = canvas.getContext('2d');

          if (!canvasContext) {
            console.error('Failed to get canvas context');
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext,
            viewport,
          };

          page
            .render(renderContext)
            .promise.then(() => {
              try {
                const dataUrl = canvas.toDataURL('image/jpeg');
                console.log(
                  `Page ${num} rendered successfully, data URL length:`,
                  dataUrl.length,
                );
                resolve(dataUrl);
              } catch (error) {
                console.error(
                  `Error converting page ${num} to data URL:`,
                  error,
                );
                reject(error);
              }
            })
            .catch((error) => {
              console.error(`Error rendering page ${num}:`, error);
              reject(error);
            });
        })
        .catch((error) => {
          console.error(`Error getting page ${num}:`, error);
          reject(error);
        });
    });
  };

  render() {
    if (this.state.error) {
      console.error('Rendering error state:', this.state.error);
      return <div>Error: {this.state.error}</div>;
    }

    return this.props.children({
      pages: this.state.pages,
      loading: this.state.pages.length === 0 && !this.state.error,
    });
  }
}

export default PDFtoIMG;
