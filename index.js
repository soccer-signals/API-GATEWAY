
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
import axios from "axios"
 import cors from 'cors'
import mongoose from "mongoose"
import User from './Database Models/User'
import { userInfo } from "os";
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb+srv://robertkingsleyiv:Mompex35@@@cluster0-arlog.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true
}).then(() => {
    console.log("Database Connection Established")
});
app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});
app.use(cors())





io.on('connection', function(socket){
    console.log('a user connected');

    socket.on("Init", (res)=>{
   
        function pushData(){
            axios.get('http://localhost:7100/client-data').then(data => {
                socket.emit("apiDataPost", data.data.finished)
                }).catch(err => {
                 console.log(err)
             })
            }
        setInterval(pushData, 2000)
    })

    socket.on("addToShortlist", (data)=>{
    console.log(data)
        data.idArrayToAdd.forEach((item, index, array) =>{


            User.findByIdAndUpdate(data.user_id, {$addToSet:{"userData.shortList": item}}, (err, resp)=>{
                if(err){
                    socket.emit("addedToShortlist", {success: false})
                  throw err
                }
                else{
                    console.log(resp)
                    if(resp.userData.shortList.includes(item)){
                        if(index === array.length - 1){
                            socket.emit("addedToShortlist", {success: false, error: "You already have this match in your shortlist."})
                        }
               
                    }
                    else{
                        if(index === array.length - 1){
                        socket.emit("addedToShortlist", {success: true})
                        }
                    }
   
                
                 
                }
             })
  
          
        })


    })
















});






http.listen(3200, function(){
  console.log('listening on *:3200');
});