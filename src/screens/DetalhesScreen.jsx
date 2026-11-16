import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default class DetalhesScreen extends Component {
  constructor(props) {
    super(props);

    // Obtém o objeto 'jogo' passado pelas rotas do React Navigation
    const jogo = props.route?.params?.jogo || {};

    this.state = {
      jogo,
      favorito: false,
      noBacklog: false,
      usuario: 'default',
    };
  }

  async componentDidMount() {
    await this.carregarDadosIniciais();
  }

  // Carrega o usuário atual e o estado do jogo na lista "Quero Jogar"
  carregarDadosIniciais = async () => {
    try {
      const { jogo } = this.state;
      const usuarioSalvo = await AsyncStorage.getItem('@gameboxd_user');
      const usuario = usuarioSalvo || 'default';
      const backlogKey = `@gameboxd_backlog_${usuario}`;

      const backlogSalvo = await AsyncStorage.getItem(backlogKey);
      const backlogAtual = backlogSalvo ? JSON.parse(backlogSalvo) : [];

      const noBacklog = backlogAtual.some((item) => item.id === jogo.id);

      this.setState({ usuario, noBacklog });
    } catch (error) {
      console.log('Erro ao carregar os dados de detalhes:', error);
    }
  };

  // Adiciona ou remove o jogo da lista "Quero Jogar" do usuário
  toggleBacklog = async () => {
    const { jogo, noBacklog, usuario } = this.state;
    const backlogKey = `@gameboxd_backlog_${usuario}`;

    try {
      const backlogSalvo = await AsyncStorage.getItem(backlogKey);
      let backlog = backlogSalvo ? JSON.parse(backlogSalvo) : [];

      if (noBacklog) {
        // Remove da lista
        backlog = backlog.filter((item) => item.id !== jogo.id);
        await AsyncStorage.setItem(backlogKey, JSON.stringify(backlog));
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        this.setState({ noBacklog: false });

        Alert.alert('Removido', `"${jogo.titulo}" foi removido da tua lista Quero Jogar.`);
      } else {
        // Adiciona à lista
        backlog.push(jogo);
        await AsyncStorage.setItem(backlogKey, JSON.stringify(backlog));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        this.setState({ noBacklog: true });

        Alert.alert('Adicionado! 📌', `"${jogo.titulo}" foi adicionado à tua lista Quero Jogar!`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a lista Quero Jogar.');
    }
  };

  // Marca e desmarca o jogo como favorito com resposta tátil (vibração)
  toggleFavorito = () => {
    this.setState((prevState) => {
      const novoFav = !prevState.favorito;

      if (novoFav) {
        // Vibração háptica forte ao favoritar
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.selectionAsync();
      }

      return { favorito: novoFav };
    });
  };

  render() {
    const { jogo, favorito, noBacklog } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14181c" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Botão de voltar */}
          <TouchableOpacity
            style={styles.btnVoltar}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.goBack();
            }}
          >
            <Text style={styles.btnVoltarTexto}>← Voltar para o Catálogo</Text>
          </TouchableOpacity>

          {/* Card com Ficha Técnica */}
          <View style={styles.detalhesCard}>
            {jogo.imagem && (
              <Image
                source={{ uri: jogo.imagem }}
                style={styles.detalhesCapa}
                resizeMode="cover"
              />
            )}

            <View style={styles.detalhesInfo}>
              <Text style={styles.detalhesTitulo}>{jogo.titulo}</Text>

              <View style={styles.detalhesMeta}>
                <Text style={styles.metaTexto}>Ano: {jogo.ano}</Text>
                <Text style={styles.notaJogo}>Nota: ★ {jogo.nota}</Text>
              </View>

              <Text style={styles.detalhesDescricao}>{jogo.descricao}</Text>

              {/* Botões de Ação */}
              <View style={styles.detalhesAcoes}>
                <TouchableOpacity
                  style={[styles.button, styles.btnPrimary]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    navigation.navigate('FormAvaliacao', { jogo });
                  }}
                >
                  <Text style={styles.btnPrimaryText}>📝 Avaliar / Registrar no Diário</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, noBacklog ? styles.btnDanger : styles.btnSecondary]}
                  onPress={this.toggleBacklog}
                >
                  <Text style={noBacklog ? styles.btnDangerText : styles.btnSecondaryText}>
                    {noBacklog ? '✖ Remover do Quero Jogar' : '📌 Quero Jogar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnFav, favorito && styles.btnFavAtivo]}
                  onPress={this.toggleFavorito}
                >
                  <Text style={[styles.btnFavTexto, favorito && styles.btnFavTextoAtivo]}>
                    {favorito ? '❤️ Favoritado' : '🤍 Favoritar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181c',
  },
  scrollContent: {
    padding: 16,
  },
  btnVoltar: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  btnVoltarTexto: {
    color: '#00e054',
    fontSize: 15,
    fontWeight: '600',
  },
  detalhesCard: {
    backgroundColor: '#1e232a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2c3440',
  },
  detalhesCapa: {
    width: '100%',
    height: 320,
  },
  detalhesInfo: {
    padding: 16,
  },
  detalhesTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  detalhesMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaTexto: {
    color: '#9ab',
    fontSize: 14,
  },
  notaJogo: {
    color: '#00e054',
    fontWeight: 'bold',
    fontSize: 15,
  },
  detalhesDescricao: {
    color: '#c0c8d0',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  detalhesAcoes: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#00e054',
  },
  btnPrimaryText: {
    color: '#14181c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnSecondary: {
    backgroundColor: '#2c3440',
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: '#ff49491a',
    borderWidth: 1,
    borderColor: '#ff4949',
  },
  btnDangerText: {
    color: '#ff4949',
    fontWeight: '600',
    fontSize: 14,
  },
  btnFav: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c3440',
    alignItems: 'center',
  },
  btnFavAtivo: {
    borderColor: '#ff4949',
    backgroundColor: '#ff494910',
  },
  btnFavTexto: {
    color: '#9ab',
    fontWeight: '600',
    fontSize: 14,
  },
  btnFavTextoAtivo: {
    color: '#ff4949',
  },
});