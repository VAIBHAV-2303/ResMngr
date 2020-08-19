/*
Write logs to console
if debugging mode is enabled
*/

exports.debugLogger = function debugLogger(debug_msg){

    if(process.env.DEBUG_FLAG=='true'){
        console.log("DEBUG LOG:", debug_msg);
    }
} 
