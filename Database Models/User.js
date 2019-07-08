const mongoose = require('mongoose');


export default mongoose.model('User', { 
 
    email: String,
    name: {first: String, Middle:String, Last:String}, 
    userData: {
        filters: [],
        signals: [],
        shortList: [],
      },
    signalAlerts:[],
    currentlyTrueSignals: []

})