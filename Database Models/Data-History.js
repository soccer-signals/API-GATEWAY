const mongoose = require('mongoose');


export default mongoose.model('DataHistory', { Data: Array, Date: String })