/*
Kyle Gorman and Will Eccles
SER492 Senior Capstone
Major and Minor Intron Dataset
Parser for inputting into database
*/
const express = require('express'); // Web Framework
const app = express();
const sql = require('mssql')

var config = {
    server: 'DESKTOP-J6DUC0L\\MSSQLSERVER19',
    database: 'master',
    user: 'adminLogin',
    password: 'admin'
};

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("app listening at http://%s:%s", host, port)
});

const LineByLineReader = require('line-by-line'),
    lr0 = new LineByLineReader('../input/input gtf.gtf'),
    lr1 = new LineByLineReader('../input/input fasta.fa');

//number of lines to read in
//if set to -1 will run entire file
var lines = 5;
var counter0 = 0;

//reads in gtf files
lr0.on('line', (line) => {
    //pause emitting of lines
    lr0.pause();
    //breaks the input into an array
    var res = line.split('\t');

    //sets the last introns coord 
    var lastIntronStartCoord = 0;
    var lastIntronEndCoord = 0;

    console.log('gtf: start ' + counter0);
    //synchronous line processing
    //the timeout is so that no two insertData can get called on top of each other
    //without it two introns can be inserted at the same time since the parser will start the next insert before the previous is complete
    //this will lead to multiple primary key insertations which will cause it to produce errors
    setTimeout(function () {
        //console.log(res);
        insertData(res, lastIntronStartCoord, lastIntronEndCoord, counter0);
        //continue emitting lines.
        lr0.resume();
    }, 800)

    //ends after x lines
    counter0++;
    if (counter0 > lines - 1 && lines != -1) {
        //closes all listeners
        lr0.close();
        lr0.removeAllListeners();
    }
});
lr0.on('end', function () {
    // All lines are read, file is closed now.
    lr0.close();
    lr0.removeAllListeners();
});

//reads in fasta files
//each gene sequence is considered a "line" not each actual line in the file
//the gene sequences are seperated by comments that begin with >
var counter1 = 0;
var linecount = 0;
var str = '';
var header = '';
lr1.on('line', (line) => {
    //console.log(line);
    if(counter1 == 0) {
        header = line;
        counter1++
    } else if (line.charAt(0) == '>') {
        lr1.pause();
        console.log('fasta: start ' + linecount);
        //console.log('Header: ' + header);
        //console.log('String: ' + str);

        //handles inserts for the fasta file
        //this timeout is so the gtf lines can be insertted first
        //insert gene seq is an update that checks the gene id, transcript id and the intron start and end coords
        //since it is update the gtf needs to be inserted first the update only will update data and not create new entries which is done by the gtf insertations
        //the entire gtf file does not need to be inserted only the corresponding lines they both can run at the same time but the fasta is on a larger delay
        setTimeout(function () {
            linecount++;
            insertGeneSeq(header, str, linecount);
            //continue emitting lines.
            header = line;
            str = '';
            counter1++
            lr1.resume();
        }, 1000)

    } else {
        str = str + line;
    }
    if (counter1 - 1 > lines - 1  && lines != -1) {
        lr1.close();
        lr1.removeAllListeners();
    }

});
lr1.on('end', function () {
    // All lines are read, file is closed now.
    lr1.close();
    lr1.removeAllListeners();
});

//handles inserting the gene sequence
function insertGeneSeq(header, str, counter) {
    //splits the header itno each of the fields
    var res = header.split(',');
    var coords = res[2].split('-');
    var ensemblGeneId = res[0].substring(1, res[0].length);
    var ensemblTranscriptId = res[1];
    var intronStartCoord = coords[0];
    var intronEndCoord = coords[1];

    var intronSequence = str;
    //connect to database
    var conn = new sql.ConnectionPool(config);

    conn.connect().then(function () {
        // creats request object
        var request = new sql.Request(conn);
        // query to the database
        request
            .input('ensemblGeneId', sql.VarChar(), ensemblGeneId)
            .input('ensemblTranscriptId', sql.NVarChar(255), ensemblTranscriptId)
            .input('intronStartCoord', sql.BigInt, intronStartCoord)
            .input('intronEndCoord', sql.BigInt, intronEndCoord)
            .input('intronSequence', sql.VarChar, intronSequence)
            .execute('[IntronDB].[dbo].[InsertGeneSequence]')
            .then(function (recordset) {
                console.log('fasta: insert complete ' + counter);
                conn.close();
            }).catch(function (err) {
                console.log('Error inserting ' + err);
                conn.close();
            });
    }).catch(function (err) {
        console.log('Error connecting: ' + err);
    });

}

function insertData(res, lastIntronStartCoord, lastIntronEndCoord, counter) {
    var speciesName = 'Homo sapien';
    var commonName = 'Human';

    //GTF file format is seqname, source, feature, start, end, score, strand, frame, then attributes
    //takes the input and splits it by tabs
    //inserts the data into the database
    var chromosome = res[0];
    var scoreType = res[1];
    var feature = res[2];
    var intronStartCoord = res[3];
    var intronEndCoord = res[4];
    var overallScore = res[5];
    if (res[6] == '+')
        var strand = 1;
    else
        var strand = 0;
    //frame is stored as a bit ./+ is 0 and - is 1
    var frame;
    if (res[7] == '-')
        frame = 1;
    else
        frame = 0;
    //the 8th item in the array ocntain the gene id and the transcript id
    //splits the 8th item of the array at the comma then makes two substrings of each
    var branchPoint = res[9].split(';')[0].substring(4, res[9].split(';')[0].length - 1);
    var breakPointScore = res[9].split(';')[1].substring(11, res[9].split(';')[1].length - 1);
    var fiveScore = res[9].split(';')[2].substring(13, res[9].split(';')[2].length - 1);
    var ensemblGeneId = res[9].split(';')[3].substring(10, res[9].split(';')[3].length - 1);
    var threeScore = res[9].split(';')[4].substring(14, res[9].split(';')[4].length - 1);
    var transcriptId = res[9].split(';')[5].substring(16, res[9].split(';')[5].length - 1);

    var ensemblGeneLink = "https://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=" + ensemblGeneId;
    var intronLength = intronEndCoord - intronStartCoord;
    var transcriptEnsemblLink = transcriptId;
    //stored as a bit 0 is U2 1 is U12
    var intronType;
    if (res[5] > 25)
        intronType = 1;
    else if (res[5] == -1)
        intronType = null;

    //sets the exon cord and type for downstream
    var exonStartCoordUp = lastIntronEndCoord + 1;
    var exonEndCoordUp = lastIntronStartCoord - 1;
    var exonStartCoordDown = lastIntronEndCoord + 1;
    var exonEndCoordDown = lastIntronStartCoord - 1;

    //connect to database
    var conn = new sql.ConnectionPool(config);

    conn.connect().then(function () {
        // creats request object
        var request = new sql.Request(conn);
        // query to the database
        request
            //.query("select * from ")
            .input('speciesName', sql.NVarChar(255), speciesName)
            .input('commonName', sql.NVarChar(255), commonName)
            // .input('genomeVersion', sql.NVarChar(255), genomeVersion)
            // .input('ensemblVersion', sql.NVarChar(255), ensemblVersion)

            //.input('geneName', sql.VarChar(), geneName)
            //.input('ncbiGeneID', sql.VarChar(), ncbiGeneId)
            .input('ensemblGeneId', sql.VarChar(), ensemblGeneId)
            //.input('geneType', sql.VarChar(), geneType)
            //.input('geneStartCoord', sql.BigInt, geneStartCoord)
            //.input('geneEndCoord', sql.BigInt(), geneEndCoord)
            //.input('geneLength', sql.Int(), geneLength)
            //.input('geneSequence', sql.NVarChar(255), geneSequence)
            //.input('ncbiGeneLink', sql.NVarChar(255), ncbiGeneLink)
            .input('ensemblGeneLink', sql.NVarChar(255), ensemblGeneLink)
            //.input('ucscLink', sql.NVarChar(255), ucscLink)

            .input('transcriptEnsemblLink', sql.NVarChar(255), transcriptEnsemblLink)
            //.input('transcriptStartCoord', sql.BigInt(), transcriptStartCoord)
            //.input('transcriptEndCoord', sql.BigInt(), transcriptEndCoord)
            .input('ensemblId', sql.NVarChar(255), transcriptId)

            .input('intronType', sql.Bit(), intronType)
            //.input('subtype', sql.VarChar(5), subtype)
            .input('intronStartCoord', sql.BigInt(), intronStartCoord)
            //.input('intronSequence', sql.VarChar(), intronSequence)
            //.input('rank', sql.Int(), rank)
            .input('intronLength', sql.Int(), intronLength)
            .input('branchPoint', sql.VarChar(), branchPoint)
            //.input('acceptorSpliceSite', sql.VarChar(), acceptorSpliceSite)
            .input('strand', sql.Bit(), strand)
            //.input('cluster', sql.Int(), cluster)
            .input('frame', sql.Bit(), frame)
            .input('chromosome', sql.VarChar(), chromosome)
            .input('intronEndCoord', sql.BigInt(), intronEndCoord)
            //.input('donorSpliceSite', sql.VarChar(), donorSpliceSite)

            .input('overallScore', sql.Float(), overallScore)
            .input('fiveScore', sql.Float(), fiveScore)
            .input('threeScore', sql.Float(), threeScore)
            .input('breakPointScore', sql.Float(), breakPointScore)
            .input('scoreType', sql.VarChar(255), scoreType)

            .input('exonStartCoordUp', sql.BigInt(), exonStartCoordUp)
            .input('exonEndCoordUp', sql.BigInt(), exonEndCoordUp)
            .input('exonStartCoordDown', sql.BigInt(), exonStartCoordDown)
            .input('exonEndCoordDown', sql.BigInt(), exonEndCoordDown)

            .execute('[IntronDB].[dbo].[InsertData]')
            .then(function (recordset) {
                console.log('gtf: insert complete ' + counter);
                conn.close();
            }).catch(function (err) {
                console.log('Error inserting ' + err);
                conn.close();
            });
    }).catch(function (err) {
        console.log('Error connecting: ' + err);
    });
}
