const path = require('path')
const mongoose = require('mongoose')
const html_to_pdf = require('html-pdf-node');
const crypto = require('crypto')
const fs = require("fs");
const { parse } = require("csv-parse");
const nodemailer = require('nodemailer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
function routes(app,dbe,lms,accounts){
    let db = dbe.collection('StudentData');
    app.get('/',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','homepage.html'))
    })

    app.get('/login',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','admin.html'))
    })
    app.get('/verify',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','verify.html'))
    })
    app.get('/generate',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','generate.html'))
    })
    app.post("/login",(req,res)=>{
        const {username,password} = req.body
        UserAdminHardCoded = 'Admin';
        UserAdminPasswordHardCoded  = 'admin'
        if(username == UserAdminHardCoded && password == UserAdminPasswordHardCoded){
            res.status(200).sendFile(path.join(__dirname,'public','addstudent.html'))
        }else{
            res.status(401).send('Admin not approved')
        }
    })
    function addStudent(row){
        let fname = row[0];
        let lname = row[1];
        let Rollno = parseInt(row[2]);
        let semester = parseInt(row[3]);
        let Email = row[4];
        let Mark1 = parseInt(row[5]);
        let Mark2 = parseInt(row[6]);
        let Mark3 = parseInt(row[7]);
        let Mark4 = parseInt(row[8]);
        let Mark5 = parseInt(row[9]);
        if(fname==""||lname==""||Rollno==""||Email==""||Mark1==""||Mark2==""||Mark3==""||Mark4==""||Mark5==""||semester==""){
            return 'Invalid data ', Rollno
        }
        let name = fname + " "+ lname
        console.log(name,Rollno,Email,Mark1,Mark2,Mark3,Mark4,Mark5)
        db.findOne({Rollno},async (err,student)=>{
            if(student){
                console.log('Already Present');
                return `already Present`
            }else{   
                let dataBase = false, blockchain = false, emailSent = false;
                console.log('Not there');
                let ContentToHash = Rollno.toString()+Mark1.toString()+Mark2.toString()+Mark3.toString()+Mark4.toString()+Mark5.toString();
                console.log(ContentToHash);
                ContentAfterHash = crypto.createHash('md5').update(ContentToHash).digest('hex');
                console.log(ContentAfterHash);
                const proc = await db.insertOne({name,Rollno,Email,Mark1,Mark2,Mark3,Mark4,Mark5})
                if(proc){
                    console.log('Stored in DB'+ Rollno);
                    dataBase = true
                }else{
                    console.log('Some error occured'+ Rollno);
                }

                const BlockChainSave = await lms.GenerateCertificate(Rollno,ContentAfterHash,{from:accounts[0]})
                if(BlockChainSave){
                    console.log('Stored in BlockChain'+ Rollno)
                    blockchain = true
                }else{
                    console.log('Some error occured to store the value in Blockchain' +Rollno)
                }
                let HTMLContent = `
                <h1> Marksheet 2022-23</h1><br><hr>
                <strong> Name : ${name}</strong><br>
                <strong> Rollno : ${Rollno}</strong><br>
                <strong> SPCC : ${Mark1} </strong> <br>
                <strong> CSS : ${Mark2} </strong> <br>
                <strong> AI : ${Mark3} </strong> <br>
                <strong> MC : ${Mark4} </strong> <br>
                <strong> QA : ${Mark5} </strong> <br>`;
                let message = `Hello ${name},<br>
                This is your marksheet of semester-6 Computer Science, Mumbai University.<br>
                It is generated using Verifier. You can check your marksheet's credibility using verifier.<br>
                Have a good day,<br> Thank you.`
                
                var transporter = nodemailer.createTransport({
                    service: 'outlook',
                    auth: {
                        user: 'verifiertheoriginal@outlook.com',
                        pass: 'Verifier$321'
                    }
                });
                let file = { content: HTMLContent };
                let options = { format: "A4" };
                const pdfBuffer = await html_to_pdf.generatePdf(file, options);
                if(pdfBuffer){
                    console.log('pdfbuffer constructed');
                    var mailOptions = {
                        from: 'verifiertheoriginal@outlook.com',
                        to: Email,
                        subject: 'Sem 6 Marksheet',
                        attachments: [{
                            filename: `Marksheet.pdf`,
                            content: pdfBuffer            
                        }],
                        html:  message,
                      };
                   
                    await transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                          
                        } else {
                          console.log('Email sent: ' + info.response);
                          emailSent = true
                          console.log(emailSent+"email"+blockchain+"block "+dataBase);
                          if(emailSent && blockchain && dataBase){
                            console("yesss")
                            }
                        }
                        return ;
                      });
                }else{
                    console.log('Could not construct pdfBuffer')
                }

                
                return 'done'
                
            }})
    }

    app.post('/generate',(req,res)=>{
        console.log('generate')
        let arr = new Array();
        fs.createReadStream("./data.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data",async function (row) {
            console.log(typeof(row));
            let fname = row[0];
            let lname = row[1];
            let Rollno = parseInt(row[2]);
            let semester = parseInt(row[3]);
            let Email = row[4];
            let Mark1 = parseInt(row[5]);
            let Mark2 = parseInt(row[6]);
            let Mark3 = parseInt(row[7]);
            let Mark4 = parseInt(row[8]);
            let Mark5 = parseInt(row[9]);
            console.log("out")
            arr.push(row)
            
        })
        .on("end", async ()=> {
            console.log(arr.length)
            for(let i =0;i< arr.length;i++){
                console.log(arr[i])
                addStudent(arr[i])
                await delay(10000)
            }
            console.log("finished");
        })
        .on("error", function (error) {
            console.log(error.message);
        });
        res.status(200).send('yes')
    })
    app.post('/addstudent',async function addStudent(req,res)
    {
        const {fname,lname,Rollno,Email,Mark1,Mark2,Mark3,Mark4,Mark5} = req.body;
        console.log(fname+lname)
        if(fname==""||lname==""||Rollno==""||Email==""||Mark1==""||Mark2==""||Mark3==""||Mark4==""||Mark5==""){
            res.send('Invalid Input! Enter data.')
        }
        let name = fname + " "+ lname
        console.log(name,Rollno,Email,Mark1,Mark2,Mark3,Mark4,Mark5)
        db.findOne({Rollno},async (err,student)=>{
            if(student){
                console.log('Already Present');
                res.status(401).sendFile(path.join(__dirname,'public','error.html'))
            }else{   
                let dataBase = false, blockchain = false, emailSent = false;
                console.log('Not there');
                let ContentToHash = Rollno.toString()+Mark1.toString()+Mark2.toString()+Mark3.toString()+Mark4.toString()+Mark5.toString();
                console.log(ContentToHash);
                ContentAfterHash = crypto.createHash('md5').update(ContentToHash).digest('hex');
                console.log(ContentAfterHash);
                const proc = await db.insertOne({name,Rollno,Email,Mark1,Mark2,Mark3,Mark4,Mark5})
                if(proc){
                    console.log('Stored in DB');
                    dataBase = true
                }else{
                    console.log('Some error occured');
                }

                const BlockChainSave = await lms.GenerateCertificate(Rollno,ContentAfterHash,{from:accounts[0]})
                if(BlockChainSave){
                    console.log('Stored in BlockChain')
                    blockchain = true
                }else{
                    console.log('Some error occured to store the value in Blockchain')
                }

                let HTMLContent = `
                <h1> Marksheet 2022-23</h1><br><hr>
                <strong> Name : ${name}</strong><br>
                <strong> Rollno : ${Rollno}</strong><br>
                <strong> SPCC : ${Mark1} </strong> <br>
                <strong> CSS : ${Mark2} </strong> <br>
                <strong> AI : ${Mark3} </strong> <br>
                <strong> MC : ${Mark4} </strong> <br>
                <strong> QA : ${Mark5} </strong> <br>`;
                let message = `Hello ${name},<br>
                This is your marksheet of semester-6 Computer Science, Mumbai University.<br>
                It is generated using Verifier. You can check your marksheet's credibility using verifier.<br>
                Have a good day,<br> Thank you.`
                const nodemailer = require('nodemailer');
                var transporter = nodemailer.createTransport({
                    service: 'outlook',
                    auth: {
                      user: 'verifiertheoriginal@outlook.com',
                      pass: 'Verifier$321'
                    }
                  });
                let file = { content: HTMLContent };
                let options = { format: "A4" };
                const pdfBuffer = await html_to_pdf.generatePdf(file, options);
                if(pdfBuffer){
                    console.log('pdfbuffer constructed');
                }else{
                    console.log('Could not construct pdfBuffer')
                }
                var mailOptions = {
                    from: 'verifiertheoriginal@outlook.com',
                    to: Email,
                    subject: 'Sem 6 Marksheet',
                    // text: 'That was easy!',
                    attachments: [{
                        filename: `Marksheet.pdf`,
                        content: pdfBuffer            
                    }],
                    html:  message,
                  };
                  
                await transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                      res.status(400).sendFile(path.join(__dirname,'public','error.html'))
                    } else {
                      console.log('Email sent: ' + info.response);
                      emailSent = true
                      if(emailSent && blockchain && dataBase){
                        res.status(200).sendFile(path.join(__dirname,'public','success.html'))
                        }
                    }
                  });

                
            }
        })
    })
    const pdfParse = require('pdf-parse')
    async function checkValid(Hash, Rollno) {
        console.log(Rollno)
        console.log(Hash)
        let data = await lms.RetrieveData(parseInt(Rollno),{from:accounts[0]});
            if(Hash == data[1])
            {
                console.log('The certificate is valid');
                return 'valid'
            }
            else
            {
                console.log('Invalid certificate');
                return 'invalid'
            }
      }
    app.post('/verifyMarksheet',async(req,res)=>{
        let content = "";
        let invalidMarksheet = false;
        console.log(req.files)
        if(!req.files && !req.files.pdfFile){
            res.status(400);
            res.send('pdf not found')
        }
        let hash = '';
        let rollno ='';
        await pdfParse(req.files.pdfFile).then(result =>{
            console.log(result.text)
            content = result.text;
            let contentArray = content.split(" ");
            console.log(contentArray)
            let mark1,mark2,mark3,mark4,mark5;
            rollno = parseInt(contentArray[7]);
            console.log('roll: '+ rollno)
            mark1 = parseInt(contentArray[10]);
            mark2 = parseInt(contentArray[13]);
            mark3 = parseInt(contentArray[16]);
            mark4 = parseInt(contentArray[19]);
            mark5 = parseInt(contentArray[22]);
            console.log(Number.isInteger(rollno))
            if(!Number.isInteger(rollno)|| !Number.isInteger(mark1) || !Number.isInteger(mark2)|| !Number.isInteger(mark3) || !Number.isInteger(mark4) || !Number.isInteger(mark5)){
                invalidMarksheet = true
                return
            }
            
            console.log(`${rollno} = ${mark1} = ${mark2} = ${mark3} = ${mark4} = ${mark5}`);
            let ContentToHash = rollno.toString()+mark1.toString()+mark2.toString()+mark3.toString()+mark4.toString()+mark5.toString();
            console.log(ContentToHash)
            hash = crypto.createHash('md5').update(ContentToHash).digest('hex')
            
            console.log(hash);
          

        })
        let resultValid = 'invalid';
        if( !invalidMarksheet){
            resultValid = await checkValid(hash,rollno);
            console.log(resultValid)
        }
        
        if(resultValid == 'valid'){
            console.log('working')
            res.status(200).send('The certificate is Valid')
        }else{
            res.status(400).send('The certificate is invalid')
        }
        
    })
}
module.exports = routes
