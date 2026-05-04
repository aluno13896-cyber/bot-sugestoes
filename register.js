const axios = require('axios');

// Preencha com seus dados do Discord Developer Portal
const BOT_TOKEN = 'MTUwMDc5OTU2NzU2MDcwODExNg.Gq4HN4.JCVHuHNBVoSfKaz8vd3fSsXOKXLq71ShBlfJfI';
const CLIENT_ID = '1500799567560708116';

const commandData = {
    name: "sugerir",
    description: "Envia uma sugestão para a administração",
    options: [{
        name: "mensagem",
        type: 3, // String
        description: "O que você quer sugerir?",
        required: true
    }]
};

axios.post(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, 
    commandData, 
    { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
).then(() => console.log("Comando registrado!"))
 .catch(err => console.error(err.response.data));
