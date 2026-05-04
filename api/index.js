import { InteractionType, InteractionResponseType } from 'discord-interactions';
import axios from 'axios';

export default async (req, res) => {
    // A Vercel recebe os dados do Discord aqui
    const { type, data, member, user } = req.body;
    const infoUsuario = member ? member.user : user;

    // 1. Quando alguém digita /sugerir
    if (type === InteractionType.APPLICATION_COMMAND && data.name === 'sugerir') {
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [{
                    title: "💡 Sistema de Sugestões",
                    description: "Clique no botão abaixo para abrir o formulário e enviar sua ideia para a nossa equipe!",
                    color: 0x5865F2, // Cor Blurple do Discord
                    footer: { text: "Tririca Store - Qualidade em primeiro lugar" }
                }],
                components: [{
                    type: 1, // Action Row
                    components: [{
                        type: 2, // Botão
                        label: "Fazer Sugestão",
                        style: 1, // Cor azul
                        custom_id: "botao_sugerir"
                    }]
                }]
            }
        });
    }

    // 2. Quando alguém clica no Botão
    if (type === InteractionType.MESSAGE_COMPONENT && data.custom_id === 'botao_sugerir') {
        return res.send({
            type: InteractionResponseType.MODAL,
            data: {
                custom_id: 'modal_sugestao',
                title: 'Nova Sugestão',
                components: [{
                    type: 1,
                    components: [{
                        type: 4, // Text Input
                        custom_id: 'campo_texto_sugestao',
                        label: "Qual a sua sugestão?",
                        style: 2, // Parágrafo longo
                        placeholder: "Escreva aqui os detalhes da sua ideia...",
                        min_length: 5,
                        max_length: 1000,
                        required: true
                    }]
                }]
            }
        });
    }

    // 3. Quando alguém envia o formulário (Modal)
    if (type === InteractionType.MODAL_SUBMIT && data.custom_id === 'modal_sugestao') {
        const sugestaoTexto = data.components[0].components[0].value;

        // Envia para o seu Webhook (canal privado)
        try {
            await axios.post(process.env.WEBHOOK_URL, {
                embeds: [{
                    title: "📌 NOVA SUGESTÃO RECEBIDA",
                    description: `**Sugestão:**\n${sugestaoTexto}`,
                    color: 0x00FF00, // Verde
                    fields: [
                        { name: "👤 Autor", value: `<@${infoUsuario.id}> (${infoUsuario.username})`, inline: true }
                    ],
                    timestamp: new Date()
                }]
            });

            // Resposta para o usuário (só ele vê)
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: "✅ **Sucesso!** Sua sugestão foi enviada para os administradores.",
                    flags: 64 // Mensagem Efêmera (privada)
                }
            });
        } catch (error) {
            console.error("Erro ao enviar webhook:", error);
        }
    }
};
