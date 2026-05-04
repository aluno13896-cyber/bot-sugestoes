import axios from 'axios';

// COLOQUE SEUS DADOS AQUI
const TOKEN = "MTUwMDc5OTU2NzU2MDcwODExNg.Gq4HN4.JCVHuHNBVoSfKaz8vd3fSsXOKXLq71ShBlfJfI";
const APPLICATION_ID = "1500799567560708116";

const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;

const commandData = {
    name: "sugerir",
    description: "Abre o menu para enviar uma sugestão",
    options: [] // Vazio, pois agora usamos botão e modal
};

async function registerCommands() {
    try {
        await axios.post(url, commandData, {
            headers: {
                Authorization: `Bot ${TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        console.log("✅ Comando registrado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao registrar:", error.response ? error.response.data : error.message);
    }
}

registerCommands();
