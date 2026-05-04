import { InteractionType, InteractionResponseType } from 'discord-interactions';
import axios from 'axios';

export default async (req, res) => {
  // 1. Resposta obrigatória para o Discord validar a URL (PING/PONG)
  // Usamos req.body?.type para evitar erros se o corpo estiver vazio
  if (req.body && req.body.type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  const { type, data, member, user } = req.body || {};
  const usuario = member ? member.user : user;

  // 2. Quando alguém usa /sugerir -> Manda a Embed com Botão
  if (type === InteractionType.APPLICATION_COMMAND && data.name === 'sugerir') {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [{
          title: "💡 Sistema de Sugestões",
          description: "Clique no botão abaixo para abrir o formulário!",
          color: 0x5865F2
        }],
        components: [{
          type: 1,
          components: [{
            type: 2,
            label: "Escrever Sugestão",
            style: 1,
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
            style: 2,
            placeholder: "Conte-nos sua ideia...",
            min_length: 10,
            required: true
          }]
        }]
      }
    });
  }

  // 4. Quando enviam o Formulário -> Manda para o Webhook
  if (type === InteractionType.MODAL_SUBMIT && data.custom_id === 'modal_envio_sugestao') {
    const textoSugerido = data.components[0].components[0].value;

    try {
      await axios.post(process.env.WEBHOOK_URL, {
        embeds: [{
          title: "📌 NOVA SUGESTÃO RECEBIDA",
          description: textoSugerido,
          color: 0xFEE75C,
          footer: { text: `Enviado por: ${usuario.username}` },
          timestamp: new Date()
        }]
      });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "✅ Sugestão enviada!",
          flags: 64
        }
      });
    } catch (err) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Erro ao enviar webhook.", flags: 64 }
      });
    }
  }
};
