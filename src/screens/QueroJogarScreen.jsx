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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default class QueroJogarScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backlog: [],
    };
    this.focusListener = null;
  }

  async componentDidMount() {
    await this.carregarBacklog();

    const { navigation } = this.props;
    if (navigation && navigation.addListener) {
      this.focusListener = navigation.addListener('focus', () => {
        this.carregarBacklog();
      });
    }
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  // Gera a chave única do AsyncStorage baseada no utilizador logado 
  getStorageKey = async () => {
    const usuario = (await AsyncStorage.getItem('@gameboxd_user')) || 'default';
    return `@gameboxd_backlog_${usuario}`;
  };

  // Busca os jogos salvos na lista "Quero Jogar" do utilizador atual
  carregarBacklog = async () => {
    try {
      const key = await this.getStorageKey();
      const dadosSalvos = await AsyncStorage.getItem(key);
      const backlog = dadosSalvos ? JSON.parse(dadosSalvos) : [];
      this.setState({ backlog });
    } catch (error) {
      console.log('Erro ao carregar a lista Quero Jogar:', error);
    }
  };

  // Abre a janela de confirmação perguntando se quer remover o jogo da lista
  confirmarRemocao = (id, titulo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remover da Lista',
      `Desejas remover "${titulo}" da tua lista Quero Jogar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => this.executarRemocao(id),
        },
      ]
    );
  };

  // Remove o jogo do array e atualiza o AsyncStorage
  executarRemocao = async (id) => {
    try {
      const key = await this.getStorageKey();
      const novoBacklog = this.state.backlog.filter((item) => item.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(novoBacklog));
      this.setState({ backlog: novoBacklog });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o jogo da lista.');
    }
  };

  // Redireciona para o formulário de avaliação
  irParaAvaliacao = (jogo) => {
    Haptics.selectionAsync();
    this.props.navigation.navigate('FormAvaliacao', { jogo });
  };

  renderItemBacklog = ({ item }) => (
    <View style={styles.cardBacklog}>
      <Image
        source={{ uri: item.imagem }}
        style={styles.capa}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <Text style={styles.tituloJogo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={styles.metaTexto}>
          Ano: {item.ano} | Nota: ★ {item.nota}
        </Text>
      </View>

      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.btnJáJoguei}
          onPress={() => this.irParaAvaliacao(item)}
        >
          <Text style={styles.btnJáJogueiTexto}>📝 Já Joguei</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnRemover}
          onPress={() => this.confirmarRemocao(item.id, item.titulo)}
        >
          <Text style={styles.btnRemoverTexto}>🗑️ Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  render() {
    const { backlog } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14181c" />

        <View style={styles.header}>
          <Text style={styles.sectionTitle}>
            📌 Quero Jogar ({backlog.length})
          </Text>
        </View>

        {backlog.length === 0 ? (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyTitle}>A tua lista está vazia!</Text>
            <Text style={styles.emptyText}>
              Navega pelo catálogo e clica em "Quero Jogar" nos jogos que pretendes experimentar.
            </Text>
            <TouchableOpacity
              style={styles.btnExplorar}
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.btnExplorarTexto}>Explorar Catálogo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={backlog}
            keyExtractor={(item) => item.id}
            renderItem={this.renderItemBacklog}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181c',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3440',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  cardBacklog: {
    backgroundColor: '#1e232a',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c3440',
  },
  capa: {
    width: 75,
    height: 105,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  tituloJogo: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  metaTexto: {
    fontSize: 12,
    color: '#9ab',
  },
  acoesContainer: {
    gap: 8,
  },
  btnJáJoguei: {
    backgroundColor: '#00e054',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnJáJogueiTexto: {
    color: '#14181c',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnRemover: {
    backgroundColor: '#ff494920',
    borderWidth: 1,
    borderColor: '#ff4949',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnRemoverTexto: {
    color: '#ff4949',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyBanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ab',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  btnExplorar: {
    backgroundColor: '#00e054',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnExplorarTexto: {
    color: '#14181c',
    fontWeight: 'bold',
    fontSize: 15,
  },
});