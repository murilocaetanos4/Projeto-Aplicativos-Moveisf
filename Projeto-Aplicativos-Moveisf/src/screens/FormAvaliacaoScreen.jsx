import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { db, collection, addDoc, updateDoc, doc } from '../firebase';

export default class FormAvaliacaoScreen extends Component {
  constructor(props) {
    super(props);

    const params = props.route?.params || {};
    const jogo = params.jogo || {};
    const avaliacaoExistente = params.avaliacaoExistente || null;

    this.state = {
      jogo,
      avaliacaoExistente,
      nota: avaliacaoExistente ? avaliacaoExistente.nota : 5,
      status: avaliacaoExistente ? avaliacaoExistente.status : 'Zerado',
      resenha: avaliacaoExistente ? avaliacaoExistente.resenha : '',
      salvando: false,
    };
  }

  vibrar = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {}
    }
  };

  handleSalvar = async () => {
    const { jogo, avaliacaoExistente, nota, status, resenha } = this.state;
    const { navigation } = this.props;

    if (!resenha.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, escreve uma breve opinião ou resenha sobre o jogo!');
      } else {
        Alert.alert('Campo Obrigatório', 'Por favor, escreve uma breve opinião ou resenha sobre o jogo!');
      }
      return;
    }

    this.setState({ salvando: true });

    try {
      const usuario = (await AsyncStorage.getItem('@gameboxd_user')) || 'default';
      const dataFormatada = new Date().toLocaleDateString('pt-BR');
      const key = `@gameboxd_diario_${usuario}`;
      const dadosSalvos = await AsyncStorage.getItem(key);
      let diario = dadosSalvos ? JSON.parse(dadosSalvos) : [];

      let novoDocId = null;

      // Tenta gravar no Firestore com limite de tempo (timeout de 2.5s)
      try {
        const promiseFirestore = avaliacaoExistente
          ? (async () => {
              if (avaliacaoExistente.docId) {
                const docRef = doc(db, 'diario', avaliacaoExistente.docId);
                await updateDoc(docRef, { nota, status, resenha, data: dataFormatada });
              }
            })()
          : (async () => {
              const docRef = await addDoc(collection(db, 'diario'), {
                usuario,
                jogoId: jogo.id,
                titulo: jogo.titulo,
                imagem: jogo.imagem,
                nota,
                status,
                resenha,
                data: dataFormatada,
                createdAt: new Date().toISOString(),
              });
              return docRef.id;
            })();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout Firebase')), 2500)
        );

        const res = await Promise.race([promiseFirestore, timeoutPromise]);
        if (res) novoDocId = res;
      } catch (errNuvem) {
        console.log('Firestore offline ou não configurado. Mantendo registo local.');
      }

      // Garante a gravação no AsyncStorage local (sempre rápido e funcional)
      if (avaliacaoExistente) {
        diario = diario.map((item) =>
          item.id === avaliacaoExistente.id
            ? { ...item, nota, status, resenha, data: dataFormatada }
            : item
        );
      } else {
        diario.unshift({
          id: Date.now().toString(),
          docId: novoDocId,
          jogoId: jogo.id,
          titulo: jogo.titulo,
          imagem: jogo.imagem,
          nota,
          status,
          resenha,
          data: dataFormatada,
        });
      }

      await AsyncStorage.setItem(key, JSON.stringify(diario));

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      this.setState({ salvando: false });
      navigation.navigate('MainTabs', { screen: 'Diario' });
    } catch (error) {
      this.setState({ salvando: false });
      navigation.navigate('MainTabs', { screen: 'Diario' });
    }
  };

  renderEstrelasSeletor = () => {
    const { nota } = this.state;
    return (
      <View style={styles.estrelasContainer}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            onPress={() => {
              this.vibrar();
              this.setState({ nota: num });
            }}
          >
            <Text style={[styles.estrelaItem, num <= nota ? styles.estrelaAtiva : styles.estrelaInativa]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  render() {
    const { jogo, status, resenha, avaliacaoExistente, salvando } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14181c" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.btnVoltar}
            onPress={() => {
              this.vibrar();
              navigation.goBack();
            }}
          >
            <Text style={styles.btnVoltarTexto}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.cardForm}>
            <View style={styles.headerJogo}>
              {jogo.imagem && (
                <Image source={{ uri: jogo.imagem }} style={styles.capaMini} resizeMode="cover" />
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.tituloHeader}>
                  {avaliacaoExistente ? 'Editar Avaliação' : 'Registrar no Diário'}
                </Text>
                <Text style={styles.subtituloHeader}>{jogo.titulo}</Text>
              </View>
            </View>

            <Text style={styles.label}>Tua Nota (1 a 5 estrelas):</Text>
            {this.renderEstrelasSeletor()}

            <Text style={styles.label}>Status de Jogatina:</Text>
            <View style={styles.statusOpcoes}>
              {['Zerado', 'Jogando', 'Abandonado'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.btnStatus, status === st && styles.btnStatusAtivo]}
                  onPress={() => {
                    this.vibrar();
                    this.setState({ status: st });
                  }}
                >
                  <Text style={[styles.btnStatusTexto, status === st && styles.btnStatusTextoAtivo]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tua Opinião / Resenha:</Text>
            <TextInput
              style={styles.inputResenha}
              placeholder="Escreve o que achaste do jogo..."
              placeholderTextColor="#678"
              multiline
              numberOfLines={4}
              value={resenha}
              onChangeText={(text) => this.setState({ resenha: text })}
            />

            <TouchableOpacity style={styles.btnSalvar} onPress={this.handleSalvar} disabled={salvando}>
              {salvando ? (
                <ActivityIndicator color="#14181c" />
              ) : (
                <Text style={styles.btnSalvarTexto}>
                  {avaliacaoExistente ? 'Atualizar Avaliação (Nuvem)' : 'Guardar no Diário (Nuvem)'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14181c' },
  scrollContent: { padding: 16 },
  btnVoltar: { marginBottom: 16, paddingVertical: 8 },
  btnVoltarTexto: { color: '#00e054', fontSize: 15, fontWeight: '600' },
  cardForm: { backgroundColor: '#1e232a', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#2c3440' },
  headerJogo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#2c3440', paddingBottom: 14 },
  capaMini: { width: 50, height: 70, borderRadius: 6, marginRight: 12 },
  headerInfo: { flex: 1 },
  tituloHeader: { color: '#9ab', fontSize: 13 },
  subtituloHeader: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginTop: 14, marginBottom: 8 },
  estrelasContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  estrelaItem: { fontSize: 32 },
  estrelaAtiva: { color: '#00e054' },
  estrelaInativa: { color: '#2c3440' },
  statusOpcoes: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  btnStatus: { flex: 1, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#2c3440', alignItems: 'center', backgroundColor: '#14181c' },
  btnStatusAtivo: { borderColor: '#00e054', backgroundColor: '#00e05420' },
  btnStatusTexto: { color: '#9ab', fontSize: 13, fontWeight: '600' },
  btnStatusTextoAtivo: { color: '#00e054' },
  inputResenha: { backgroundColor: '#14181c', color: '#ffffff', borderRadius: 8, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#2c3440', minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  btnSalvar: { backgroundColor: '#00e054', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnSalvarTexto: { color: '#14181c', fontWeight: 'bold', fontSize: 16 },
});