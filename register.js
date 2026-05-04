import axios from 'axios';

// PREENCHA AQUI
const BOT_TOKEN = 'MTUwMDc5OTU2NzU2MDcwODExNg.Gq4HN4.JCVHuHNBVoSfKaz8vd3fSsXOKXLq71ShBlfJfI';
const CLIENT_ID = '1500799567560708116';

const commandData = {
    name: "sugerir",
    description: "Abre o menu de sugestão com botão",
    options: [] 
};

async function registerCommand() {
    try {
        await axios.post(
            `https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, 
            commandData, 
            { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
        );
        console.log("✅ Comando /sugerir atualizado com sucesso!");
    } catch (err) {
        console.error("❌ Erro:", err.response ? err.response.data : err.message);
    }
}

registerCommand();
