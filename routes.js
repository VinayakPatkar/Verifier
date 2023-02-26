const path = require('path')
const mongoose = require('mongoose')
const html_to_pdf = require('html-pdf-node');
const crypto = require('crypto')
const fs = require("fs");
const { parse } = require("csv-parse");
const nodemailer = require('nodemailer');

const pdfParse = require('pdf-parse')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
function routes(app,dbe,lms,accounts){
    let db = dbe.collection('StudentData');
    app.get('/',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','homepage.html'))
    })

    app.get('/login',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','admin.html'))
    })
    app.get('/dashboard',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','dashboard.html'))
    })
    app.get('/verify',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','verify.html'))
    })
    app.get('/reissueMarksheet',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','reissue.html'))
    })
    app.get('/generate',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','generate.html'))
    })
    app.get('/generate',(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','generate.html'))
    })
    app.post("/login",(req,res)=>{
        const {username,password} = req.body
        UserAdminHardCoded = 'Admin';
        UserAdminPasswordHardCoded  = 'admin'
        if(username == UserAdminHardCoded && password == UserAdminPasswordHardCoded){
            res.status(200).sendFile(path.join(__dirname,'public','adminDashboard.html'))
        }else{
            res.status(401).send('Admin not approved')
        }
    })
    app.post("/aMarksheet",(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','addstudent.html'))
    })
    app.post("/csvMarksheet",(req,res)=>{
        res.status(200).sendFile(path.join(__dirname,'public','generate.html'))
    })
    function marksheetTemp(name,Rollno,Mark1,Mark2,Mark3,Mark4,Mark5){
        let avg = (Mark1+Mark2+Mark3+Mark4+Mark5)/5;
        let grade = ""
        if(avg>80){
            grade = "A"
        }else if(avg>60){
            grade = "B"
        }else if(avg>40){
            grade = "C"
        }else{
            grade = "D"
        }
        let HTMLContent = `
                <!doctype html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
                    <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
                    <script>
                        tailwind.config = {
                            theme: {
                                extend: {
                                    fontFamily: {
                                        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
                                    },
                                }
                            }
                        }
                    </script>
                </head>
                <body class="antialiased">
                <div class="prose lg:prose-2xl mx-auto my-2 border rounded border-blue-500">
                    <div class="flex flex-nowrap justify-center">
                        <div class="grid grid-rows-auto gap-0">
                            <div id="header" class="flex justify-around items-center px-10 gap-10">
                                <img class="w-24  rounded" src="https://justtsolutions.files.wordpress.com/2018/08/mumbai-university-logo.jpg?w=500"
                                    alt="logo">
                                <div class="grid grid-rows-auto gap-1 py-2 text-center rounded ">
                                    <span class="text-2xl font-semibold uppercase">Fr. C. Rodrigues Institute of Technology</span>
                                    <span class="text-base">
                                        Motto: Love Your Neighbour As Your Self<br>
                                        Sector 9-A, Vashi, Navi Mumbai, Maharashtra, India PIN - 400703 <br>
                                        Tel: 070xxxxxxxxx, 090xxxxxxxxx <br>
                                    </span>
                                    <span class="text-1xl font-semibold uppercase">Marks Sheet</span>
                                </div>

                                <img class="w-24 rounded" src="https://uploads.sarvgyan.com/2015/08/Fr.-C.-Rodrigues-Institute-of-Technology-Vashi.jpg"
                                    alt="logo">
                            </div>
                            <div id="studentProfile" class="flex justify-between items-center prose-table:my-0 p-3 gap-4">
                                <table class="table-fixed border-collapse border border-slate-400 uppercase font-semibold">
                                    <tbody>
                                    <tr>
                                        <td class="border border-slate-400 text-sm">SESSION: <span>2023</span></td>
                                        <td class="border border-slate-400 text-sm">EXAMINATION: <span>SUMMER SESSION</span></td>
                                        <td class="border border-slate-400 text-sm">SEAT NO: ${Rollno}</td>
                                    </tr>
                                    <tr>
                                        <td class="border border-slate-400 text-sm">NAME OF STUDENT: <span> ${name}</span></td>
                                        <td class="border border-slate-400 text-sm">SEMISTER: <span>6<sup>th</sup></span></td>
                                        <td class="border border-slate-400 text-sm">ROLL NO:  ${Rollno}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div id="academicRecord" class="grid grid-rows-auto  prose-table:my-0 p-3 gap-1">
                                <table class="table-fixed border-collapse border border-slate-400 text-center uppercase font-semibold">
                                    <thead>
                                    <tr>
                                    <th class="border border-slate-400 text-sm">COURSE CODE</th>
                                    <th class="border border-slate-400 text-sm">COURSE NAME</th>
                                    <th class="border border-slate-400 text-sm">MAXIMUM MARKS</th>
                                    <th class="border border-slate-400 text-sm">OBTAINED MARKS</th>
                                    </tr>
                                    <tr>
                                    <td class="border border-slate-400 text-sm">CSC601</td>
                                    <td class="border border-slate-400 text-sm text-left">System Programming & Compiler Construction</td>
                                    <td class="border border-slate-400 text-sm">100 </td>
                                    <td class="border border-slate-400 text-sm">${Mark1} </td>
                                    </tr>
                                    <tr>
                                    <td class="border border-slate-400 text-sm">CSC602</td>
                                    <td class="border border-slate-400 text-sm text-left">Cryptography & System Security </td>
                                    <td class="border border-slate-400 text-sm">100 </td>
                                    <td class="border border-slate-400 text-sm">${Mark2} </td>
                                    </tr>
                                    <tr>
                                    <td class="border border-slate-400 text-sm">CSC603</td>
                                    <td class="border border-slate-400 text-sm text-left">Mobile Computing</td>
                                    <td class="border border-slate-400 text-sm">100 </td>
                                    <td class="border border-slate-400 text-sm"> ${Mark4}</td>
                                    </tr>
                                    <tr>
                                    <td class="border border-slate-400 text-sm">CSC604 </td>
                                    <td class="border border-slate-400 text-sm text-left">Artificial Intelligence</td>
                                    <td class="border border-slate-400 text-sm">100 </td>
                                    <td class="border border-slate-400 text-sm"> ${Mark3}</td>
                                    </tr>
                                    <tr>
                                    <td class="border border-slate-400 text-sm">CSDLO601 1/3</td>
                                    <td class="border border-slate-400 text-sm text-left">Department Level Optional Course -2</td>
                                    <td class="border border-slate-400 text-sm">100 </td>
                                    <td class="border border-slate-400 text-sm">${Mark5} </td>
                                    </tr>
                                    </thead>
                                </table>
                                <table class="table-fixed border-collapse border border-slate-400 text-left uppercase font-semibold">
                                    <thead>
                                    <tr>
                                        <th class="border border-slate-400 text-sm">TOTAL MARKS OBTAINABLE: <span>500 </span></th>
                                        <th class="border border-slate-400 text-sm">TOTAL MARKS OBTAINED: <span>${parseInt(Mark1)+parseInt(Mark2)+parseInt(Mark3)+parseInt(Mark4)+parseInt(Mark5)}</span></th>
                                        <th class="border border-slate-400 text-sm">GRADE: <br> <span>${grade}</span></th>
                                    </tr>
                                    </thead>
                                </table> 
                            </div>
                            <div id="remarks" class="prose-table:my-0 p-3 gap-1">
                                <table class="table-auto border-collapse border border-slate-400 font-semibold">
                                    <thead>
                                    <tr>
                                        <th class="border border-slate-400 text-sm">
                                            <span class="uppercase">Abbrevations: </span>
                                            <span>P-Pass, F-Fail, AB-Absent</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th class="border border-slate-400 text-sm">
                                            <span class="uppercase">NOTE:</span>
                                            <span>THIS IS A COMPUTER GENERATED PDF.</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th class="border border-slate-400 text-sm">
                                            <span class="uppercase">Issue Month:</span>
                                            <span class="uppercase">June,2023</span>
                                            
                                        </th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                            <span class="font-semibold text-center">******FOR AUTHENTICITY USE VERIFIER******</span>
                        </div>
                    </div>
                </div>
                </body>
                </html>`;
        return HTMLContent;
    }
    function messageContent(name){
        let message = `Hello ${name},<br>
                This is your marksheet of semester-6 Computer Science, Mumbai University.<br>
                It is generated using Verifier. You can check your marksheet's credibility using verifier.<br>
                Have a good day,<br> Thank you.`
        return message
    }
    app.post("/reissue",(req,res)=>{
        let Rollno = parseInt(req.body.rollNo);
        console.log(Rollno)
        db.findOne({Rollno},async (err,student)=>{
            console.log(student)
            if(!student){
                res.status(400).sendFile(path.join(__dirname,'public','error.html'))
                console.log(`Roll No: ${Rollno} is not present. Please enter the correct Roll No.`);
            }else{
                console.log(student);
                
                let HTMLContent = marksheetTemp(student.name,Rollno,student.Mark1,student.Mark2,student.Mark3,student.Mark4,student.Mark5)
                let message = messageContent(student.name)
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
                    to: student.Email,
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
                      res.status(400).sendFile(path.join(__dirname,'public','error.html'))
                    } else {
                      console.log('Email sent: ' + info.response);
                      res.status(200).sendFile(path.join(__dirname,'public','success.html'))
                    }
                  });
            }
        })
    })
    app.post("/listall",(req,res)=>{
        db.find({}).toArray(function(err, result) {
            if (err) {
                console.log(err);
                res.status(400).sendFile(path.join(__dirname,'public','error.html'))
            } else {
                
                res.render("listAll", { student: result })
            }
           
            
          });
        }
    )
   
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
            return true
        }
        let name = fname + " "+ lname
        console.log(name,Rollno,Email,Mark1,Mark2,Mark3,Mark4,Mark5)
        db.findOne({Rollno},async (err,student)=>{
            if(student){
                console.log('Already Present');
                return true
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
                    return true
                }

                const BlockChainSave = await lms.GenerateCertificate(Rollno,ContentAfterHash,{from:accounts[0]})
                if(BlockChainSave){
                    console.log('Stored in BlockChain'+ Rollno)
                    blockchain = true
                }else{
                    console.log('Some error occured to store the value in Blockchain' +Rollno)
                    return true
                }
                let HTMLContent = marksheetTemp(name,Rollno,Mark1,Mark2,Mark3,Mark4,Mark5)
                let message = messageContent(name)
                
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
                          return true
                          
                        } else {
                          console.log('Email sent: ' + info.response);
                          emailSent = true
                        
                          if(emailSent && blockchain && dataBase){
                            console("yesss")
                            return true
                            }
                        }
                        return false;
                      });
                }else{
                    console.log('Could not construct pdfBuffer')
                }

                
                return false
                
            }})
    }

    app.post('/generate',(req,res)=>{
        console.log('generate')
        let arr = new Array();
        fs.createReadStream("./data.csv")
        .pipe(parse({ delimiter: ",", from_line: 1 }))
        .on("data",async function (row) {
            arr.push(row)
        })
        .on("end", async ()=> {
            console.log(arr.length)
            for(let i =0;i< arr.length;i++){
                let error = false
                error = addStudent(arr[i])
                console.log(error)
                if(error){
                    console.log(arr[i][0]+arr[i][2]+' already present');
                    continue;
                }
                await delay(10000)
            }
            console.log("finished");
            res.status(200).sendFile(path.join(__dirname,'public','success.html'))
        })
        .on("error", function (error) {
            console.log(error.message);
            res.status(400).sendFile(path.join(__dirname,'public','error.html'))
        });
        
    })
    app.post('/addstudent',async(req,res)=>
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

                let HTMLContent = marksheetTemp(name,Rollno,Mark1,Mark2,Mark3,Mark4,Mark5)
                let message = messageContent(name)
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
            content = result.text;
            let contentArray = content.split(" ");
            let mark1,mark2,mark3,mark4,mark5;
            rollno = parseInt(contentArray[34]);
            console.log('roll: '+ rollno)
            for(let i =0; i<contentArray.length;i++){
                console.log(i," -> ", contentArray[i])
            }
            try{
                mark1 = parseInt(contentArray[39].split("\n")[3].slice(3));
                mark2 = parseInt(contentArray[41].split("\n")[1].slice(3));
                mark4 = parseInt(contentArray[41].split("\n")[5].slice(3));
                mark3 = parseInt(contentArray[41].split("\n")[9].slice(3));
                mark5 = parseInt(contentArray[44].split("\n")[1].slice(3));
            }catch(e){
                console.log(e)
                invalidMarksheet = true
                return
            }

            console.log(mark1+mark2+mark3+mark4+mark5)
            if(!Number.isInteger(rollno)|| !Number.isInteger(mark1) || !Number.isInteger(mark2)|| !Number.isInteger(mark3) || !Number.isInteger(mark4) || !Number.isInteger(mark5)){
                invalidMarksheet = true
                return
            }
            
            console.log(`${rollno} = ${mark1} = ${mark2} = ${mark3} = ${mark4} = ${mark5}`);
            let ContentToHash = rollno.toString()+mark1.toString()+mark2.toString()+mark3.toString()+mark4.toString()+mark5.toString();
            console.log(ContentToHash)
            hash = crypto.createHash('md5').update(ContentToHash).digest('hex')
            
            console.log("calculated Hash -> "+hash);
          

        })
        let resultValid = 'invalid';
        if( !invalidMarksheet){
            resultValid = await checkValid(hash,rollno);
            console.log("blockchain hash ->"+resultValid)
        }
        
        if(resultValid == 'valid'){
            res.status(200).send('The certificate is Valid')
        }else{
            res.status(400).send('The certificate is invalid')
        }
        
    })
}
module.exports = routes
