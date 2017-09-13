
require('dotenv').config({ path: 'environment.env' });

//process.env.USER_ID + process.env.USER_PWD + 

module.exports = {

    'secret': 'mysecret',
    'database': 'mongodb://adiwakar:Mars2314@cluster0-shard-00-00-mcudm.mongodb.net:27017,cluster0-shard-00-01-mcudm.mongodb.net:27017,cluster0-shard-00-02-mcudm.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'

};