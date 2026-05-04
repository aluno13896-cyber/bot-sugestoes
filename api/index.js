import { InteractionType, InteractionResponseType } from 'discord-interactions';
import axios from 'axios';

export default async (req, res) => {
  const { type, data, member, user } = req.body;
  const usuario = member ? member.user : user;

  // 1. Responde ao Discord para manter a conexão viva
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // 2. Quando alguém usa /sugerir -> Manda a Embed com Botão
  if (type === InteractionType.APPLICATION_COMMAND && data.name === 'sugerir') {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [{
          title: "💡 Sistema de Sugestões - Tririca Store",
          description: "Clique no botão abaixo para abrir o formulário e enviar sua ideia!",
          color: 0x5865F2,
          thumbnail: { url: 'https://cdn.discordapp.com/embed/avatars/0.png' }
        }],
        components: [{
          type: 1,
          components: [{
            type: 2,
            label: "Escrever Sugestão",
            style: 1, // Azul
            custom_id: "abrir_modal_sugestao",
            emoji: { name: "📝" }
          }]
        }]
      }
    });
  }

  // 3. Quando clicam no Botão -> Abre o Formulário (Modal)
  if (type === InteractionType.MESSAGE_COMPONENT && data.custom_id === 'abrir_modal_sugestao') {
    return res.send({
      type: InteractionResponseType.MODAL,
      data: {
        custom_id: 'modal_envio_sugestao',
        title: 'Formulário de Sugestão',
        components: [{
          type: 1,
          components: [{
            type: 4,
            custom_id: 'texto_da_sugestao',
            label: "O que você quer sugerir?",
            style: 2, // Estilo parágrafo (grande)
            placeholder: "Conte-nos sua ideia detalhadamente...",
            min_length: 10,
            required: true
          }]
        }]
      }
    });
  }

  // 4. Quando enviam o Formulário -> Manda para o seu Webhook
  if (type === InteractionType.MODAL_SUBMIT && data.custom_id === 'modal_envio_sugestao') {
    const textoSugerido = data.components[0].components[0].value;

    await axios.post(process.env.WEBHOOK_URL, {
      embeds: [{
        title: "📌 NOVA SUGESTÃO RECEBIDA",
        description: textoSugerido,
        color: 0xFEE75C,
        fields: [{ name: "Enviado por:", value: `${usuario.username}#${usuario.discriminator || '0'}` }],
        timestamp: new Date()
      }]
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "✅ Sua sugestão foi enviada com sucesso para a administração!",
        flags: 64 // Só a pessoa vê essa confirmação
      }
    });
  }
};
