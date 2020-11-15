const express = require("express");
const router = express.Router();
var multer = require('multer');
var ImageKit = require("imagekit");
var XLSX = require('xlsx');
const fs = require('fs');
var { PythonShell } = require('python-shell');
var path = require("path");

// Storage for Excel files
var storage = multer.diskStorage ({
  filename: (req, file, cb)=>{
    cb(null, Date.now() + "_" + file.originalname)
   }
})
var upload = multer({ storage: storage }).single('file');

function get_header_row(sheet) {
  var headers = [];
  var range = XLSX.utils.decode_range(sheet['!ref']);
  var C, R = range.s.r; /* start in the first row */
  /* walk every column in the range */
  for(C = range.s.c; C <= range.e.c; ++C) {
      var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */
      var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
      if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);
      headers.push(hdr);
  }
  return headers;
}

router.post('/upload', upload, async (req, res) => {
  req.setTimeout(0);
  let fileinfo = req.file;
  const userId = (req.body.userId).trim();
  const workbook = XLSX.readFile(fileinfo.path);
  const sheetNames = workbook.SheetNames;
  const featureNames = get_header_row(workbook.Sheets[sheetNames[0]]);
  const outputPath = path.join(
    path.parse(fileinfo.path).dir,
    path.parse(fileinfo.path).name + "_result" + path.parse(fileinfo.path).ext);
  res.send(JSON.stringify({inputPath: fileinfo.path, outputPath: outputPath, featureNames: featureNames}));
})

router.post('/grouping', async (req, res) => {
  options = {
    pythonOptions: ['-u'], 
    args: ['-s', JSON.stringify(req.body)]
  };
  PythonShell.run('./process/corrosion_loop/corrosion_looping.py', options, async function (err, results) {
    if (err) {
      throw err;
    }
    console.log(results);
    res.send("Data is updated");
    console.log('Finish creating corrosion loops.');
  }); 
})

router.get('/download', function(req, res) {
  const downloadPath = "./temp/result/output.xlsx";
  res.download(downloadPath);
});

module.exports = router;