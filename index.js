
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
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

// axios.post('http://localhost:3200/api', {
//     type: "userHasSignal",
//     account: account._id,
//   })

app.post('/api', (req,res) =>{
  console.log(req.body)
res.send("Thanks")
})

function sendUserDataUpdateSignal(socket, userData, sendMessage){
    User.findById(userData).then(data=>{ socket.emit("updateUser", data)}).catch(err => {throw Error(err)})
       
    if(sendMessage){
        
        socket.emit("alert", {
            type: sendMessage.type,
            text: sendMessage.text

        })

    }
    
}
function newUser(data){
    return new Promise((res, rej)=>{
        User.create({
            email: data.email,
            password: data.password,
            name: {first: "Demo", Middle:String, Last:"User"}, 
        })

       .then(resp => {
            res(resp)
       })
       .catch(err => {
        throw new Error(err)
   })
 
    })
}
function addToShortlist(data, socket){
    return new Promise ((res, rej)=>{
     console.log(data)
        data.matches.forEach((item, index) =>{
            console.log(index)


            User.findByIdAndUpdate(data._id, {$addToSet:{"userData.shortList": item}}, (err, resp)=>{
                sendUserDataUpdateSignal(socket, data._id)
                if(err){
                    socket.emit("addedToShortlist", {success: false})
                    rej(err)
                  throw Error(err)
                }
                else{
                    console.log(resp)

                    if(resp.userData.shortList.includes(item)){
                      
                            socket.emit("failedShortlistAdd", {success: false, error: `You already have match: ${item} in your shortlist.`})

                  console.log(item)
               
                    }
                    else{
                        if(index === data.matches.length - 1){
                            socket.emit("addedToShortlist", {success: true})
                        }
                    }
   
                
                 
                }
             })
  
          
        })

        res()
    })

}

var activeUsers = []


io.on('connection', (socket)=>{

socket.on("disconnect",(event)=>{

    User.findOne({email:'demo@user.com'}).then(resp => {
        socket.emit("loginResponse", resp)


   
                var app = activeUsers.findIndex(item => item.id == resp.id, 1)
                activeUsers.splice(app, 1)
          
  
      
    })
  

})



socket.on("LoginTemp", ()=>{

    User.findOne({email:'demo@user.com'}).then(resp => {
        socket.emit("loginResponse", resp)


        if(activeUsers.length <= 0){

            activeUsers.push({id:resp._id})
   

        }
        else{
        activeUsers.forEach(user=>{
         
           
            if(JSON.stringify(user.id)  == JSON.stringify(resp._id)){
                console.log("user already in")
    
            }
            else{
                activeUsers.push({id:resp._id})
     
            }
        })
        }
        console.log(activeUsers)
    })
  
})
socket.on("addToShortlist", (data)=>{
  addToShortlist(data, socket).then()
 
})
    socket.on("New-User", (data)=>{
        newUser(data)
        .then(newUser=>{
            console.log("New User Created")
            console.log(newUser)
        })
        .catch(err =>{
            console.log(err)
        })
     
    })

    socket.on("removeShortlistItem", (data)=>{
       User.findByIdAndUpdate(data.user, {$pull: {'userData.shortList': data.idToBeRemoved}}).then(resp=>{
        socket.emit("removedShortlistItemSuccess", {"success": true})
        console.log(resp)
        sendUserDataUpdateSignal(socket, data.user)
       }).catch(err =>{
           throw Error(err)
       })
    })
    socket.on("addSignal", (data)=>{
    
        User.findByIdAndUpdate(data._id, {$addToSet: {'userData.signals': data.signal}}).then(resp=>{
            console.log("done")
            sendUserDataUpdateSignal(socket, data._id, {type: "success", text: "Signal Added!"})
        })
        .catch(err => {
            throw Error(err)
        })
        
    })
   

    socket.on("removeSignal", (data)=>{

     User.findOneAndUpdate({_id:data._id,"userData.signals.name": data.toDelete}, {$pull:{'userData.signals':{"name":data.toDelete}}}).then(resp=>{
        sendUserDataUpdateSignal(socket, data._id, {type: "success", text: "Signal Removed!"})
     })


    })
   


    socket.on("addMatch(s)ToSignal", (data)=>{
        console.log(data)
        data.matches.forEach(match => {
            User.findOneAndUpdate({_id: data._id, 'userData.signals.name': data.signal}, {$addToSet:{"userData.signals.$.matchesToWatch": match}})
            .then(resp =>{
         
                if(resp != null||undefined){
   
                        sendUserDataUpdateSignal(socket, data._id, {type: "success", text: "Matches Added!"})
            
            
               
         
                  

                }
            })


        })
 

     
         })
     
  
     







   
    function pushData(){
            axios.get('http://localhost:7100/client-data').then(data => {
                socket.emit("apiDataPost", data.data.finished)
                }).catch(err => {
                 console.log(err)
             })

    }
    setInterval(pushData, 2000)


    socket.on("initUserData", (requestData)=>{
        console.log(requestData)
        function sendUserData(_id){
           return new Promise ((resolve, reject)=>{
               User.findById(_id).then(resp=>{
                   resolve(resp)
               })
               .catch(err=>{
                   reject(err)
                   throw Error("Error Finding User In Database")
               })
           })
        }
        sendUserData(requestData.user._id).then(resp => {
            console.log(resp)
        })
    })


});





















http.listen(3200, function(){
  console.log('listening on *:3200');
});