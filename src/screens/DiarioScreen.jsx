import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { db, collection, getDocs, deleteDoc, doc, query, where } from '../firebase';

export default class DiarioScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diario: [],
      carregando: true,
    };
    this.focusListener = null;
  }

  async componentDidMount() {
    await this.carregarDiario();

    const { navigation } = this.props;
    if (navigation && navigation.addListener) {
      this.focusListener = navigation.addListener('focus', () => {
        this.carregarDiario();
      });
    }
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  vibrar = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {}
    }
  };

  // --- READ (Recuperar dados com fallback rápido) ---
  carregarDiario = async () => {
    this.setState({ carregando: true });
    try {
      const usuario = (await AsyncStorage.getItem('@gameboxd_user')) || 'default';
      let diarioNuvem = [];

      try {
        const promiseFirestore = (async () => {
          const q = query(collection(db, 'diario'), where('usuario', '==', usuario));
          const querySnapshot = await getDocs(q);
          const lista = [];
          querySnapshot.forEach((documento) => {
            lista.push({
              id: documento.id,
              docId: documento.id,
              ...documento.data(),
            });
          });
          return lista;
        })();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout Firestore')), 2000)
        );

        diarioNuvem = await Promise.race([promiseFirestore, timeoutPromise]);
      } catch (err) {
        console.log('Firestore offline ou indisponível. A carregar dados locais.');
      }

      if (diarioNuvem && diarioNuvem.length > 0) {
        this.setState({ diario: diarioNuvem, carregando: false });
        await AsyncStorage.setItem(`@gameboxd_diario_${usuario}`, JSON.stringify(diarioNuvem));
      } else {
        const localData = await AsyncStorage.getItem(`@gameboxd_diario_${usuario}`);
        this.setState({ diario: localData ? JSON.parse(localData) : [], carregando: false });
      }
    } catch (error) {
      const usuario = (await AsyncStorage.getItem('@gameboxd_user')) || 'default';
      const localData = await AsyncStorage.getItem(`@gameboxd_diario_${usuario}`);
      this.setState({ diario: localData ? JSON.parse(localData) : [], carregando: false });
    }
  };

  confirmarExclusao = (item) => {
    this.vibrar();

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(
        `Tens a certeza de que desejas remover "${item.titulo}" do teu diário?`
      );
      if (confirmou) {
        this.executarExclusao(item);
      }
    } else {
      Alert.alert(
        'Remover Avaliação',
        `Tens a certeza de que desejas remover "${item.titulo}" do teu diário?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => this.executarExclusao(item),
          },
        ]
      );
    }
  };

  // --- DELETE (Remover com fallback local instantâneo) ---
  executarExclusao = async (item) => {
    try {
      const usuario = (await AsyncStorage.getItem('@gameboxd_user')) || 'default';
      const novoDiario = this.state.diario.filter((d) => d.id !== item.id);
      
      this.setState({ diario: novoDiario });
      await AsyncStorage.setItem(`@gameboxd_diario_${usuario}`, JSON.stringify(novoDiario));

      if (item.docId) {
        try {
          const promiseDelete = deleteDoc(doc(db, 'diario', item.docId));
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout Delete')), 1500)
          );
          await Promise.race([promiseDelete, timeoutPromise]);
        } catch (e) {
          console.log('Removido apenas localmente (Firestore offline/timeout).');
        }
      }

      this.vibrar();
    } catch (error) {
      console.log('Erro ao eliminar:', error);
    }
  };

  renderEstrelas = (qtd) => '★'.repeat(qtd) + '☆'.repeat(5 - qtd);

  renderItemDiario = ({ item }) => {
    const { navigation } = this.props;

    return (
      <View style={styles.cardDiario}>
        <Image source={{ uri: item.imagem }} style={styles.capa} resizeMode="cover" />

        <View style={styles.infoContainer}>
          <View style={styles.headerCard}>
            <Text style={styles.tituloJogo} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text style={styles.dataTexto}>{item.data}</Text>
          </View>

          <View style={styles.metaContainer}>
            <Text style={styles.estrelas}>{this.renderEstrelas(item.nota)}</Text>
            <View style={styles.badgeStatus}>
              <Text style={styles.badgeTexto}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.resenhaTexto}>"{item.resenha}"</Text>
        </View>

        <View style={styles.acoesContainer}>
          <TouchableOpacity
            style={styles.btnEditar}
            onPress={() => {
              this.vibrar();
              navigation.navigate('FormAvaliacao', {
                jogo: { id: item.jogoId, titulo: item.titulo, imagem: item.imagem },
                avaliacaoExistente: item,
              });
            }}
          >
            <Text style={styles.btnAcaoTexto}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnExcluir}
            onPress={() => this.confirmarExclusao(item)}
          >
            <Text style={styles.btnAcaoTexto}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const { diario, carregando } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14181c" />

        <View style={styles.header}>
          <Text style={styles.sectionTitle}>
            📖 Meu Diário de Jogos ({diario.length})
          </Text>
        </View>

        {carregando ? (
          <View style={styles.emptyBanner}>
            <ActivityIndicator size="large" color="#00e054" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>A carregar da nuvem...</Text>
          </View>
        ) : diario.length === 0 ? (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyTitle}>Seu diário ainda está vazio!</Text>
            <Text style={styles.emptyText}>
              Navegue pelo catálogo na Home e adicione suas opiniões sobre os jogos que jogou.
            </Text>
            <TouchableOpacity
              style={styles.btnExplorar}
              onPress={() => {
                this.vibrar();
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.btnExplorarTexto}>Explorar Jogos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={diario}
            keyExtractor={(item) => item.id}
            renderItem={this.renderItemDiario}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14181c' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2c3440' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  listContent: { padding: 16, gap: 14 },
  cardDiario: { backgroundColor: '#1e232a', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2c3440' },
  capa: { width: 75, height: 105, borderRadius: 6 },
  infoContainer: { flex: 1, marginHorizontal: 12 },
  headerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tituloJogo: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, flex: 1, marginRight: 6 },
  dataTexto: { fontSize: 11, color: '#678' },
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  estrelas: { color: '#00e054', fontSize: 14, marginRight: 8 },
  badgeStatus: { backgroundColor: '#2c3440', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeTexto: { color: '#00e054', fontSize: 11, fontWeight: '600' },
  resenhaTexto: { color: '#c0c8d0', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  acoesContainer: { gap: 8 },
  btnEditar: { backgroundColor: '#2c3440', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnExcluir: { backgroundColor: '#ff494920', borderWidth: 1, borderColor: '#ff4949', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnAcaoTexto: { fontSize: 14 },
  emptyBanner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ab', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  btnExplorar: { backgroundColor: '#00e054', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnExplorarTexto: { color: '#14181c', fontWeight: 'bold', fontSize: 15 },
});