import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { IPDFService } from '../types';
import { APP_CONFIG } from '../constants/config';

const DOCUMENTS_DIR = `${FileSystem.documentDirectory}docvault/pdfs/`;

/** Creates PDF files from arrays of image URIs using expo-print. */
export class PDFService implements IPDFService {
  async createFromImages(imageUris: string[], documentName: string): Promise<string> {
    // Read each image as base64 and embed it in a full-page HTML layout.
    // The filter is applied via a <canvas> draw so the transformed pixels are
    // committed to the bitmap BEFORE expo-print rasterises the page to PDF.
    const base64Pages = await Promise.all(
      imageUris.map((uri) =>
        FileSystem.readAsStringAsync(uri, {
          encoding: 'base64' as FileSystem.EncodingType,
        }),
      ),
    );

    const scanFilter = APP_CONFIG.pdfScanFilter;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;background:#f5f5f0}
    @page{margin:0;size:A4}
    .page{
      page-break-after:always;
      width:210mm;height:297mm;
      display:flex;align-items:center;justify-content:center;
      background:#f5f5f0;overflow:hidden
    }
    canvas{max-width:100%;max-height:100%}
  </style>
</head>
<body>
${base64Pages.map((_, i) => `<div class="page"><canvas id="c${i}"></canvas></div>`).join('\n')}
<script>
(function(){
  var pages=${JSON.stringify(base64Pages)};
  var filter=${JSON.stringify(scanFilter)};
  var done=0;
  pages.forEach(function(b64,i){
    var img=new Image();
    img.onload=function(){
      var cv=document.getElementById('c'+i);
      cv.width=img.naturalWidth;
      cv.height=img.naturalHeight;
      var ctx=cv.getContext('2d');
      if(filter){ctx.filter=filter;}
      ctx.drawImage(img,0,0);
      done++;
    };
    img.src='data:image/jpeg;base64,'+b64;
  });
})();
</script>
</body>
</html>`;

    const { uri: tmpUri } = await Print.printToFileAsync({ html, base64: false });

    await FileSystem.makeDirectoryAsync(DOCUMENTS_DIR, { intermediates: true });
    const safeName = documentName.replace(/[^a-z0-9]/gi, '_');
    const destUri = `${DOCUMENTS_DIR}${safeName}_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: tmpUri, to: destUri });

    return destUri;
  }

  async getFileSizeKB(fileUri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      if (!info.exists) return 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Math.round(((info as any).size ?? 0) / 1024);
    } catch {
      return 0;
    }
  }
}
