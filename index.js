    const express=require('express');
    const app=express();
    require('dotenv').config();
    const mysql=require('mysql');
    const cors=require('cors');
    const excel=require('exceljs');
    app.use(express.json());
    app.use(cors());
    const PORT=process.env.PORT||3000;
    const db=mysql.createConnection({
        host:process.env.MYSQL_HOST,
        user:process.env.MYSQL_USER,
        password:process.env.MYSQL_PASSWORD,
        database:process.env.MYSQL_DATABASE,
        port:process.env.MYSQL_PORT
    });
    db.connect((e)=>{
        if(e){
            throw e;
        }else{
            console.log('Mysql Connected');
        }
    })
    app.post('/addData',(req,res)=>{
    const {id,name,username,phone,website,address,company,email}=req.body;
        const insertQuery=`Insert into user(id,name,username,phone,website,address,company,email)values(?,?,?,?,?,?,?,?)`;
        const values=[id,name,username,phone,website,address,company,email];
                db.query(insertQuery,values,(err,result)=>{
                    if(err) throw err;
                return res.status(201).send({
                    status:201,
                    message:"Data inserted successfully"
                })
                    })
    });
    app.get('/getData',(req,res)=>{
        const getId='Select id from user';
        db.query(getId,(err,result)=>{
            if(err) throw err;
            return res.status(200).send({
                status:200,
                data:result
            })
        })
    })
    app.post('/addPost',(req,res)=>{
        const posts=req.body;
        posts.forEach((post)=>{
            const insertQuery=`Insert into posts(id,userId,title,body)values(?,?,?,?)`;
            const values=[post.id,post.userId,post.title,post.body];
            db.query(insertQuery,values,(err,result)=>{
                if(err) throw err;
            })
    })
        return res.status(201).send({
            status:201,
            message:"Data Saved successfully"
            })
    });
    app.post('/checkId',(req,res)=>{
        const {id}=req.body;
        const getId=`Select * from posts where userId=${id}`;
        db.query(getId,(err,result)=>{
            if(err) throw err;
            if(result.length>0)
            {
                return res.status(200).send({
                    status:200,
                    data:true

                })
            }else{
                return res.status(200).send({
                    status:200,
                    data:false

                })
            }
        })
    })
    app.post('/download',(req,res)=>{
        const{id}=req.body;
        const query=`Select * from posts where userId=${id}`;
        db.query(query,(err,result)=>{
            if(err) throw err;
            let workbook=new excel.Workbook();
            let workSheet=workbook.addWorksheet(`Details of userID ${id}`);
            workSheet.columns=[
                {header:"userId",key:"userId",width:25},
                {header:"id",key:"id",width:25},
                {header:"title",key:"title",width:50},
                {header:"body",key:"body",width:100}
            ];
             result.forEach((row)=>{
                workSheet.addRow({
                    userId:row.userId,
                    id:row.id,
                    title:row.title,
                    body:row.body
                });
            });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + `userId${id}.xlsx`);
            workbook.xlsx.write(res).then(function(){
                res.end();
            })
        })
    })
    app.listen(PORT,()=>{
        console.log('Server is Running on the port',PORT);
    })