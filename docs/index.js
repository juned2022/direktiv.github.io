// Cloning github examples in Temp MKD folder
// step 1: run command npm i git-clone inside terminal
// Run node index.js

var clone = require('git-clone');
var path = require("path"),
    fs = require("fs");

clone('https://github.com/direktiv/direktiv-examples.git', './MKD' );


//-----code below ------------------------------------------------------------------------------


function fromDir(__dirname, filter) {
    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(__dirname)) {
        console.log("no dir ", __dirname);
        return;
    }
    var files = fs.readdirSync(__dirname);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(__dirname, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter); //recurse
        } else if (filename.endsWith(filter)) {
            // console.log('-- found: ', filename);
            // we found are reading files as filename below done some operation on filename string  /home/juned/Direktiv1/direktiv.github.io/docs/MKD/request-external-api/READMe.md

             var splitString = filename.split('/');
            // console.log(splitString[1]);

            var data = (splitString[1]);
            // console.log(data)

            var dataArr = [];
            dataArr.push(data);
            // console.log(dataArr); // created array of required names from filename            
            
            for(data in dataArr) {
                    fs.rename('/home/juned/Direktiv/direktiv.github.io/docs/MKD/' + dataArr[data] + '/README' + '.md', '/home/juned/Direktiv/direktiv.github.io/docs/MKD/' + dataArr[data] + '/' + dataArr[data] + '.md', renameCallback); 
                    //  /home/juned/Direktiv/direktiv.github.io/docs/MKD/aws/README.md
                    //  direktiv.github.io/docs/MKD/aws/README.md relative path is not working
                    
               
                    function renameCallback(err) {
                             if ( err ) console.log('ERROR: ' + err);
                         };
                }
        }
    }
}

fromDir("./", "README.md");



