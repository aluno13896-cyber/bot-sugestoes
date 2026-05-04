import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';
import axios from 'axios';

// Função para transformar o body em buffer (necessário para a validação de segurança)
async function getRawBody(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    // 1. Configurações de Segurança do Discord
    const PUBLIC_KEY = process.env.PUBLIC_KEY;
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    
    // Pegar o corpo da requisição de forma bruta para validar a assinatura
    const rawBody = await getRawBody(req);

    const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        PUBLIC_KEY
    );

    if (!isValidRequest) {
        return res.status(401).send('Assinatura inválida');
    }

    // Converter o corpo de volta para JSON para usar os dados
    const interaction = JSON.parse(rawBody.toString());
    const { type, data, member, user } = interaction;

    // 2. Responder ao PING do Discord (Validação da URL)
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    // 3. Lógica do Comando de Sugestão
    if (type === InteractionType.APPLICATION_COMMAND) {
        if (data.name === 'sugerir') {
            // Pega o texto que o usuário digitou
            const sugestaoTexto = data.options[0].value;
            // Pega o nome de quem enviou (pode estar em 'member' ou 'user')
            const usuarioNome = member?.user?.username || user?.username;
            const usuarioId = member?.user?.id || user?.id;

            try {
                // Enviar para o seu Canal Privado via Webhook
                await axios.post(process.env.WEBHOOK_URL, {
                    embeds: [{
                        title: "📥 Nova Sugestão Recebida",
                        color: 0x00A2E8, // Azul
                        description: sugestaoTexto,
                        fields: [
                            {
                                name: "Autor",
                                value: `${usuarioNome} (<@${usuarioId}>)`,
                                inline: true
                            }
                        ],
                        footer: { text: "Sistema de Sugestões" },
                        timestamp: new Date()
                    }]
                });

                // Resposta que aparece para o usuário no Discord
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `✅ Olá **${usuarioNome}**, sua sugestão foi enviada com sucesso para a nossa equipe!`,
                        flags: 64 // Torna a mensagem efêmera (só o usuário vê)
                    }
                });

            } catch (error) {
                console.error("Erro ao enviar webhook:", error);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "❌ Ocorreu um erro ao processar sua sugestão. Tente novamente mais tarde.",
                        flags: 64
                    }
                });
            }
        }
    }
}
