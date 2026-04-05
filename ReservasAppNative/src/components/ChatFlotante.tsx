import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { APP_CONFIG } from '../config/appConfig';
import { areaService } from '../services/api';

interface Mensaje {
  id: number;
  texto: string;
  esUsuario: boolean;
  hora: string;
  accion?: { tipo: string; params?: any };
}

export default function ChatFlotante() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      texto: '¡Hola! ¿En qué puedo ayudarte hoy?',
      esUsuario: false,
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [areas, setAreas] = useState<any[]>([]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Cargar áreas para mostrar precios
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      const response = await areaService.obtenerTodas();
      setAreas(response.areas || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  // Sinónimos y variaciones para búsqueda más robusta
  const sinonimos: { [key: string]: string[] } = {
    'reserva': ['reservar', 'agendar', 'apartar', 'separar', 'reservación', 'booking'],
    'precio': ['costo', 'valor', 'tarifa', 'cuanto cuesta', 'cuánto', 'pagar', 'cobrar'],
    'cancelar': ['anular', 'eliminar reserva', 'borrar', 'quitar'],
    'horario': ['hora', 'disponibilidad', 'cuando', 'schedule', 'tiempo'],
    'ayuda': ['ayudame', 'ayudar', 'necesito', 'auxilio', 'help'],
    'hola': ['buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hola', 'ola'],
    'soporte': ['ayuda', 'contacto', 'support', 'asistencia', 'problema'],
  };

  // Normalizar texto para búsqueda (quitar tildes, minúsculas, etc)
  const normalizarTexto = (texto: string): string => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Sistema de scoring para encontrar mejor respuesta
  const calcularScore = (mensaje: string, palabrasClave: string[]): number => {
    const mensajeNorm = normalizarTexto(mensaje);
    let score = 0;

    palabrasClave.forEach(palabra => {
      const palabraNorm = normalizarTexto(palabra);
      
      // Coincidencia exacta
      if (mensajeNorm === palabraNorm) {
        score += 10;
      }
      // Contiene la palabra completa
      else if (mensajeNorm.includes(palabraNorm)) {
        score += 5;
      }
      // Similitud parcial (fuzzy)
      else if (calcularSimilitud(mensajeNorm, palabraNorm) > 0.7) {
        score += 3;
      }

      // Bonus por sinónimos
      if (sinonimos[palabraNorm]) {
        sinonimos[palabraNorm].forEach(sinonimo => {
          if (mensajeNorm.includes(normalizarTexto(sinonimo))) {
            score += 4;
          }
        });
      }
    });

    return score;
  };

  // Algoritmo simple de similitud de Levenshtein
  const calcularSimilitud = (s1: string, s2: string): number => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (s1: string, s2: string): number => {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  const respuestasAutomaticas: { [key: string]: { texto: string; palabrasClave: string[]; accion?: any } } = {
    'hola': {
      texto: '¡Hola! Estoy aquí para ayudarte con tus reservas. ¿Qué necesitas?',
      palabrasClave: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'],
    },
    'ayuda': {
      texto: 'Puedo ayudarte con:\n• Ver y reservar áreas\n• Consultar precios\n• Ver tu historial\n• Cancelar reservas\n• Contactar soporte',
      palabrasClave: ['ayuda', 'ayudame', 'necesito', 'auxilio'],
    },
    'reserva': {
      texto: 'Para hacer una reserva, puedes ver todas las áreas disponibles. ¿Quieres que te lleve allí?',
      palabrasClave: ['reserva', 'reservar', 'agendar', 'apartar', 'booking'],
      accion: { tipo: 'navegar', pantalla: 'Areas' },
    },
    'horario': {
      texto: 'Los horarios disponibles varían según el área. Te recomiendo ver las áreas para conocer sus horarios específicos.',
      palabrasClave: ['horario', 'hora', 'disponibilidad', 'cuando', 'schedule'],
      accion: { tipo: 'navegar', pantalla: 'Areas' },
    },
    'cancelar': {
      texto: 'Puedes cancelar tu reserva desde el Historial de Reservas. ¿Quieres que te lleve allí?',
      palabrasClave: ['cancelar', 'anular', 'eliminar reserva', 'borrar'],
      accion: { tipo: 'navegar', pantalla: 'Historial' },
    },
    'precio': {
      texto: '💰 Aquí están los precios de nuestras áreas:\n\n' + 
             (areas.length > 0 
               ? areas.map(area => `• ${area.nombre}: $${area.tarifa_hora}/hora`).join('\n')
               : 'Cargando precios...'),
      palabrasClave: ['precio', 'costo', 'valor', 'tarifa', 'cuanto', 'pagar'],
    },
    'soporte': {
      texto: 'Para contactar soporte directo, presiona el botón de WhatsApp abajo o llámanos.',
      palabrasClave: ['soporte', 'ayuda', 'contacto', 'problema', 'asistencia'],
    },
  };

  const enviarMensaje = () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje: Mensaje = {
      id: mensajes.length + 1,
      texto: mensaje,
      esUsuario: true,
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajes([...mensajes, nuevoMensaje]);
    setMensaje('');

    // Respuesta automática con sistema de scoring
    setTimeout(() => {
      let mejorRespuesta = {
        key: '',
        score: 0,
        data: { texto: '', palabrasClave: [] as string[], accion: undefined as any },
      };

      // Buscar la mejor coincidencia usando scoring
      Object.entries(respuestasAutomaticas).forEach(([key, data]) => {
        const score = calcularScore(mensaje, data.palabrasClave);
        if (score > mejorRespuesta.score) {
          mejorRespuesta = { key, score, data };
        }
      });

      let respuestaTexto = mejorRespuesta.score > 0
        ? mejorRespuesta.data.texto
        : '🤖 No entendí tu pregunta. Intenta preguntar sobre: reservas, precios, horarios, cancelaciones o soporte.';

      // Si pregunta por precios, actualizar con datos reales
      if (mejorRespuesta.key === 'precio' && areas.length > 0) {
        respuestaTexto = '💰 Aquí están los precios de nuestras áreas:\n\n' + 
                        areas.map(area => `• ${area.nombre}: $${area.tarifa_hora}/hora`).join('\n') +
                        '\n\n¿Quieres ver más detalles de alguna área?';
      }

      const respuestaMensaje: Mensaje = {
        id: mensajes.length + 2,
        texto: respuestaTexto,
        esUsuario: false,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        accion: mejorRespuesta.data.accion,
      };

      setMensajes((prev) => [...prev, respuestaMensaje]);
      
      // Scroll al final
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 500);
  };

  const ejecutarAccion = (accion: { tipo: string; pantalla?: string; params?: any }) => {
    if (accion.tipo === 'navegar' && accion.pantalla) {
      setVisible(false);
      setTimeout(() => {
        navigation.navigate(accion.pantalla as never, accion.params as never);
      }, 300);
    }
  };

  const contactarWhatsApp = () => {
    const phoneNumber = APP_CONFIG.SUPPORT_WHATSAPP_NUMBER;
    const url = `whatsapp://send?phone=${phoneNumber}`;
    Linking.openURL(url).catch(() => {
      const webUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}`;
      Linking.openURL(webUrl);
    });
  };

  const preguntasRapidas = [
    { id: 1, texto: '¿Cómo reservar?', emoji: '📅' },
    { id: 2, texto: '¿Cuánto cuesta?', emoji: '💰' },
    { id: 3, texto: '¿Cómo cancelar?', emoji: '❌' },
    { id: 4, texto: 'Hablar con soporte', emoji: '🆘' },
  ];

  const handlePreguntaRapida = (pregunta: string) => {
    setMensaje(pregunta);
    setTimeout(() => enviarMensaje(), 100);
  };

  return (
    <>
      {/* Botón flotante */}
      <Animated.View
        style={[
          styles.floatingButton,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => setVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="chatbubble-ellipses" size={28} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal del chat */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.chatContainer}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarOnline}>
                  <Icon name="chatbubbles" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Asistente Virtual</Text>
                  <View style={styles.onlineIndicator}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>En línea</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Mensajes */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {mensajes.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageWrapper,
                    msg.esUsuario ? styles.messageWrapperUser : styles.messageWrapperBot,
                  ]}
                >
                  {!msg.esUsuario && (
                    <View style={styles.botAvatar}>
                      <Icon name="chatbubbles" size={16} color="#fff" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      msg.esUsuario ? styles.messageBubbleUser : styles.messageBubbleBot,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.esUsuario ? styles.messageTextUser : styles.messageTextBot,
                      ]}
                    >
                      {msg.texto}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        msg.esUsuario ? styles.messageTimeUser : styles.messageTimeBot,
                      ]}
                    >
                      {msg.hora}
                    </Text>
                    {msg.accion && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => ejecutarAccion(msg.accion!)}
                      >
                        <Text style={styles.actionButtonText}>
                          {msg.accion.pantalla === 'Areas' ? '📍 Ver Áreas' : 
                           msg.accion.pantalla === 'Historial' ? '📋 Ver Historial' : 
                           '➡️ Ir'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Preguntas rápidas */}
            {mensajes.length <= 2 && (
              <View style={styles.quickReplies}>
                <Text style={styles.quickRepliesTitle}>Preguntas frecuentes:</Text>
                <View style={styles.quickRepliesContainer}>
                  {preguntasRapidas.map((pregunta) => (
                    <TouchableOpacity
                      key={pregunta.id}
                      style={styles.quickReplyButton}
                      onPress={() => handlePreguntaRapida(pregunta.texto)}
                    >
                      <Text style={styles.quickReplyEmoji}>{pregunta.emoji}</Text>
                      <Text style={styles.quickReplyText}>{pregunta.texto}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={contactarWhatsApp}
              >
                <Icon name="logo-whatsapp" size={24} color="#25D366" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor="#999"
                value={mensaje}
                onChangeText={setMensaje}
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !mensaje.trim() && styles.sendButtonDisabled,
                ]}
                onPress={enviarMensaje}
                disabled={!mensaje.trim()}
              >
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 1000,
  },
  chatButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4a90e2',
    padding: 16,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarOnline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleUser: {
    backgroundColor: '#4a90e2',
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextBot: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageTimeBot: {
    color: '#999',
  },
  quickReplies: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickRepliesTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  quickReplyEmoji: {
    fontSize: 16,
  },
  quickReplyText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  whatsappButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButton: {
    marginTop: 8,
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
