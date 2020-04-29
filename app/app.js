/*
Kyle Gorman and Will Eccles
SER492 Senior Capstone
Major and Minor Intron Dataset
Rest api and server
*/
const express = require('express'); // Web Framework
const app = express();
const sql = require('mssql')

var config = {
    server: 'DESKTOP-J6DUC0L\\MSSQLSERVER19', //update this with the server on your computer
    database: 'master',
    user: 'adminLogin',
    password: 'admin'
};

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("app listening at http://%s:%s", host, port)
});

app.get('/api/gene', function (req, res) {
    sql.connect(config, function () {
        var request = new sql.Request();
        request.query('select * from [IntronDB].[dbo].[Gene]', function (err, recordset) {
            if (err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
        });
    });
});

app.get('/api/exon', function (req, res) {
    sql.connect(config, function () {
        var request = new sql.Request();
        request.query('select * from [IntronDB].[dbo].[Exon]', function (err, recordset) {
            if (err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
        });
    });
});

app.get('/api/intron', function (req, res) {
    sql.connect(config, function () {
        var request = new sql.Request();
        request.query('select * from [IntronDB].[dbo].[Intron]', function (err, recordset) {
            if (err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
        });
    });
});

app.get('/api/score', function (req, res) {
    sql.connect(config, function () {
        var request = new sql.Request();
        request.query('select * from [IntronDB].[dbo].[Score]', function (err, recordset) {
            if (err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
        });
    });
});

app.get('/api/species', function (req, res) {
    sql.connect(config, function () {
        var request = new sql.Request();
        request.query('select * from [IntronDB].[dbo].[Species]', function (err, recordset) {
            if (err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
        });
    });
});

app.get('/api/transcript', function (req, res) {
    sql.connect(config, function () {
        var request = new sql.Request();
        request.query('select * from [IntronDB].[dbo].[Transcript]', function (err, recordset) {
            if (err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
        });
    });
});

app.get('/api/search', function (req, res) {

    var spInput = req.query.speciesName;
    var vInput = req.query.version;
    var egInput = req.query.ensemblGene;
    var etInput = req.query.ensemblTranscript;
    var gsInput = req.query.geneSymbol;
    var icInput = req.query.intronClass;
    var lInput = req.query.length;
    var sInput = req.query.strand;
    var sqInput = req.query.sequence;
    var rInput = req.query.rank;

    // connect to database
    var conn = new sql.ConnectionPool(config);
    conn.connect().then(function () {

        // creats request object
        var request = new sql.Request(conn);

        // query to the database
        request
            //.query("select * from ")
            .input('SpeciesName', sql.NVarChar(255), spInput)
            .input('Version', sql.NVarChar(255), vInput)
            .input('EnsemblGeneId', sql.VarChar(), egInput)
            .input('EnsemblTranscriptId', sql.NVarChar(255), etInput)
            .input('GeneSymbol', sql.VarChar(), gsInput)
            .input('IntronClass', sql.Bit(), icInput)
            .input('Length', sql.Int(), lInput)
            .input('Strand', sql.Bit(), sInput)
            .input('Sequence', sql.VarChar(), sqInput)
            .input('Rank', sql.Int(), rInput)
            .execute('[IntronDB].[dbo].[SearchProcedure]')
            .then(function (recordset) {
                // sends records as a response
                res.end(JSON.stringify(recordset)); // Result in JSON format
                conn.close();
            }).catch(function (err) {
                console.log(err);
                conn.close();
            });
    }).catch(function (err) {
        console.log(err);
    });
})


app.get('/api/insert', function (req, res) {

    var speciesName = req.query.speciesName;
    var commonName = req.query.commonName;
    var genomeVersion = req.query.genomeVersion;
    var ensemblVersion = req.query.ensemblVersion;
    var geneName = req.query.geneName;
    var ncbiGeneId = req.query.ncbiGeneId;
    var ensemblGeneId = req.query.ensemblGeneId;
    var geneType = req.query.geneType;
    var geneStartCoord = req.query.geneStartCoord;
    var geneEndCoord = req.query.geneEndCoord;
    var geneLength = req.query.geneLength;
    var geneSequence = req.query.geneSequence;
    var ncbiGeneLink = req.query.ncbiGeneLink;
    var ensemblGeneLink = req.query.ensemblGeneLink;
    var ucscLink = req.query.ucscLink;
    var transcriptEnsemblLink = req.query.transcriptEnsemblLink;
    var transcriptStartCoord = req.query.transcriptStartCoord;
    var transcriptEndCoord = req.query.transcriptEndCoord;
    var intronType = req.query.intronType;
    var subtype = req.query.subtype;
    var intronStartCoord = req.query.intronStartCoord;
    var intronSequence = req.query.intronSequence;
    var rank = req.query.rank;
    var intronLength = req.query.intronLength;
    var branchPoint = req.query.branchPoint;
    var acceptorSpliceSite = req.query.acceptorSpliceSite;
    var strand = req.query.strand;
    var cluster = req.query.cluster;
    var frame = req.query.frame;
    var chromosome = req.query.chromosome;
    var intronEndCoord = req.query.intronEndCoord;
    var donorSpliceSite = req.query.donorSpliceSite;
    var overallScore = req.query.overallScore;
    var fiveScore = req.query.fiveScore;
    var threeScore = req.query.threeScore;
    var breakPointScore = req.query.breakPointScore;
    var scoreType = req.query.scoreType;
    var exonStartCoordUp = req.query.exonStartCoordUp;
    var exonEndCoordUp = req.query.exonEndCoordUp;
    var exonStartCoordDown = req.query.exonStartCoordDown;
    var exonEndCoordDown = req.query.exonEndCoordDown;
    var exonType = req.query.exonType;

    // connect to database
    var conn = new sql.ConnectionPool(config);
    conn.connect().then(function () {

        // creats request object
        var request = new sql.Request(conn);

        // query to the database
        request
            //.query("select * from ")
            .input('speciesName', sql.NVarChar(255), speciesName)
            .input('commonName', sql.NVarChar(255), commonName)
            .input('genomeVersion', sql.NVarChar(255), genomeVersion)
            .input('ensemblVersion', sql.NVarChar(255), ensemblVersion)

            .input('geneName', sql.VarChar(), geneName)
            .input('ncbiGeneID', sql.VarChar(), ncbiGeneId)
            .input('ensemblGeneId', sql.VarChar(), ensemblGeneId)
            .input('geneType', sql.VarChar(), geneType)
            .input('geneStartCoord', sql.BigInt, geneStartCoord)
            .input('geneEndCoord', sql.BigInt(), geneEndCoord)
            .input('geneLength', sql.Int(), geneLength)
            .input('geneSequence', sql.NVarChar(255), geneSequence)
            .input('ncbiGeneLink', sql.NVarChar(255), ncbiGeneLink)
            .input('ensemblGeneLink', sql.NVarChar(255), ensemblGeneLink)
            .input('ucscLink', sql.NVarChar(255), ucscLink)

            .input('transcriptEnsemblLink', sql.NVarChar(255), transcriptEnsemblLink)
            .input('transcriptStartCoord', sql.BigInt(), transcriptStartCoord)
            .input('transcriptEndCoord', sql.BigInt(), transcriptEndCoord)

            .input('intronType', sql.Bit(), intronType)
            .input('subtype', sql.VarChar(5), subtype)
            .input('intronStartCoord', sql.BigInt(), intronStartCoord)
            .input('intronSequence', sql.VarChar(), intronSequence)
            .input('rank', sql.Int(), rank)
            .input('intronLength', sql.Int(), intronLength)
            .input('branchPoint', sql.VarChar(), branchPoint)
            .input('acceptorSpliceSite', sql.VarChar(), acceptorSpliceSite)
            .input('strand', sql.Bit(), strand)
            .input('cluster', sql.Int(), cluster)
            .input('frame', sql.Bit(), frame)
            .input('chromosome', sql.VarChar(), chromosome)
            .input('intronEndCoord', sql.BigInt(), intronEndCoord)
            .input('donorSpliceSite', sql.VarChar(), donorSpliceSite)

            .input('overallScore', sql.Float(), overallScore)
            .input('fiveScore', sql.Float(), fiveScore)
            .input('threeScore', sql.Float(), threeScore)
            .input('breakPointScore', sql.Float(), breakPointScore)
            .input('scoreType', sql.VarChar(255), scoreType)

            .input('exonStartCoordUp', sql.BigInt(), exonStartCoordUp)
            .input('exonEndCoordUp', sql.BigInt(), exonEndCoordUp)
            .input('exonStartCoordDown', sql.BigInt(), exonStartCoordDown)
            .input('exonEndCoordDown', sql.BigInt(), exonEndCoordDown)
            .input('exonType', sql.VarChar(), exonType)

            .execute('[IntronDB].[dbo].[InsertData]')
            .then(function (recordset) {
                // sends records as a response
                res.end(JSON.stringify(recordset)); // Result in JSON format
                console.log('insert complete');
                conn.close();
            }).catch(function (err) {
                console.log(err);
                conn.close();
            });
    }).catch(function (err) {
        console.log(err);
    });
})


app.get('/api/insertGene', function (req, res) {

    var ensemblGeneId = req.query.ensemblGeneId;
    var ensemblTranscriptId = req.query.ensemblTranscriptId;
    var intronStartCoord = req.query.intronStartCoord;
    var intronEndCoord =req.query.intronEndCoord;

    sql.connect().then(function () {
        // creats request object
        var request = new sql.Request(conn);
        // query to the database
        request
            .input('ensemblGeneId', sql.VarChar(), ensemblGeneId)
            .input('ensemblTranscriptId', sql.NVarChar(255), ensemblTranscriptId)
            .input('intronStartCoord', sql.BigInt, intronStartCoord)
            .input('intronEndCoord', sql.BigInt, intronEndCoord)
            .input('intronSequence', sql.VarChar, intronSequence)
            .execute('[InrtonDB].[dbo].[InsertGeneSequence]')
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
});