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
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default class PerfilScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nomeUsuario: 'Jogador',
      novoNome: 'Jogador',
      editandoNome: false,
      totalDiario: 0,
      totalQueroJogar: 0,
    };
    this.focusListener = null;
  }

  async componentDidMount() {
    await this.carregarPerfil();

    const { navigation } = this.props;
    if (navigation && navigation.addListener) {
      this.focusListener = navigation.addListener('focus', () => {
        this.carregarPerfil();
      });
    }
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  // Carrega os dados do utilizador logado e calcula as contagens das estatísticas
  carregarPerfil = async () => {
    try {
      const usuarioSalvo = (await AsyncStorage.getItem('@gameboxd_user')) || 'Jogador';
      
      const diarioSalvo = await AsyncStorage.getItem(`@gameboxd_diario_${usuarioSalvo}`);
      const backlogSalvo = await AsyncStorage.getItem(`@gameboxd_backlog_${usuarioSalvo}`);

      const diario = diarioSalvo ? JSON.parse(diarioSalvo) : [];
      const backlog = backlogSalvo ? JSON.parse(backlogSalvo) : [];

      this.setState({
        nomeUsuario: usuarioSalvo,
        novoNome: usuarioSalvo,
        totalDiario: diario.length,
        totalQueroJogar: backlog.length,
      });
    } catch (error) {
      console.log('Erro ao carregar o perfil:', error);
    }
  };

  handleSalvarNome = async () => {
    const { nomeUsuario, novoNome } = this.state;
    const nomeLimpo = novoNome.trim();

    if (!nomeLimpo || nomeLimpo === nomeUsuario) {
      this.setState({ editandoNome: false });
      return;
    }

    try {
      const diarioAntigo = (await AsyncStorage.getItem(`@gameboxd_diario_${nomeUsuario}`)) || '[]';
      const backlogAntigo = (await AsyncStorage.getItem(`@gameboxd_backlog_${nomeUsuario}`)) || '[]';

      await AsyncStorage.setItem(`@gameboxd_diario_${nomeLimpo}`, diarioAntigo);
      await AsyncStorage.setItem(`@gameboxd_backlog_${nomeLimpo}`, backlogAntigo);

      const contasSalvas = await AsyncStorage.getItem('@gameboxd_accounts');
      let contas = contasSalvas ? JSON.parse(contasSalvas) : {};
      
      Object.keys(contas).forEach((emailKey) => {
        if (contas[emailKey].nome === nomeUsuario) {
          contas[emailKey].nome = nomeLimpo;
        }
      });
      await AsyncStorage.setItem('@gameboxd_accounts', JSON.stringify(contas));

      await AsyncStorage.setItem('@gameboxd_user', nomeLimpo);

      if (Platform.OS !== 'web') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
      }

      this.setState({
        nomeUsuario: nomeLimpo,
        editandoNome: false,
      });

      if (Platform.OS === 'web') {
        window.alert('O teu nome de utilizador foi alterado com sucesso!');
      } else {
        Alert.alert('Perfil Atualizado! 👤', 'O teu nome de utilizador foi alterado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o nome de utilizador.');
    }
  };

  // Função de logout que limpa os dados e redireciona para o Login
  executarLogout = async () => {
    try {
      await AsyncStorage.removeItem('@gameboxd_user');
      
      if (Platform.OS !== 'web') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
      }

      // Tenta resetar o histórico de navegação para a tela de Login
      const { navigation } = this.props;
      if (navigation.reset) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.log('Erro ao encerrar a sessão:', error);
    }
  };

  // Solicita confirmação adaptada para Web e Mobile
  handleLogout = () => {
    if (Platform.OS !== 'web') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    }

    // Se estiver a correr no navegador Web, usa o confirm nativo do browser
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmou = window.confirm('Tens a certeza de que desejas encerrar a sessão?');
      if (confirmou) {
        this.executarLogout();
      }
      return;
    }

    // Se estiver no Android / iOS, usa o Alert nativo do React Native
    Alert.alert(
      'Sair da Conta',
      'Tens a certeza de que desejas encerrar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar Sessão',
          style: 'destructive',
          onPress: () => this.executarLogout(),
        },
      ]
    );
  };

  render() {
    const {
      nomeUsuario,
      novoNome,
      editandoNome,
      totalDiario,
      totalQueroJogar,
    } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14181c" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardPerfil}>
            <Text style={styles.avatarIcon}>👤</Text>

            {!editandoNome ? (
              <View style={styles.nomeContainer}>
                <Text style={styles.nomeTitulo}>{nomeUsuario}</Text>
                <TouchableOpacity
                  style={styles.btnEditarNome}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      try { Haptics.selectionAsync(); } catch (e) {}
                    }
                    this.setState({ editandoNome: true });
                  }}
                >
                  <Text style={styles.btnEditarNomeTexto}>✏️ Editar Nome</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formEdicao}>
                <TextInput
                  style={styles.inputNome}
                  value={novoNome}
                  onChangeText={(text) => this.setState({ novoNome: text })}
                  autoFocus
                />
                <View style={styles.botoesEdicao}>
                  <TouchableOpacity
                    style={[styles.button, styles.btnSalvar]}
                    onPress={this.handleSalvarNome}
                  >
                    <Text style={styles.btnSalvarTexto}>Salvar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.btnCancelar]}
                    onPress={() =>
                      this.setState({ editandoNome: false, novoNome: nomeUsuario })
                    }
                  >
                    <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.gridEstatisticas}>
              <TouchableOpacity
                style={styles.cardStat}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    try { Haptics.selectionAsync(); } catch (e) {}
                  }
                  navigation.navigate('Diario');
                }}
              >
                <Text style={styles.statNumero}>{totalDiario}</Text>
                <Text style={styles.statLabel}>Jogos no Diário 📖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardStat}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    try { Haptics.selectionAsync(); } catch (e) {}
                  }
                  navigation.navigate('QueroJogar');
                }}
              >
                <Text style={styles.statNumeroVerde}>{totalQueroJogar}</Text>
                <Text style={styles.statLabel}>Quero Jogar 📌</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnEncerrarSessao} onPress={this.handleLogout}>
              <Text style={styles.btnEncerrarSessaoTexto}>🚪 Encerrar Sessão</Text>
            </TouchableOpacity>
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
    justify: 'center',
  },
  cardPerfil: {
    backgroundColor: '#1e232a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c3440',
  },
  avatarIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  nomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nomeTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  btnEditarNome: {
    backgroundColor: '#2c3440',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnEditarNomeTexto: {
    color: '#00e054',
    fontWeight: '600',
    fontSize: 13,
  },
  formEdicao: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputNome: {
    backgroundColor: '#14181c',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2c3440',
    textAlign: 'center',
    width: '80%',
    marginBottom: 10,
  },
  botoesEdicao: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnSalvar: {
    backgroundColor: '#00e054',
  },
  btnSalvarTexto: {
    color: '#14181c',
    fontWeight: 'bold',
  },
  btnCancelar: {
    backgroundColor: '#2c3440',
  },
  btnCancelarTexto: {
    color: '#ffffff',
  },
  gridEstatisticas: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 10,
  },
  cardStat: {
    flex: 1,
    backgroundColor: '#14181c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c3440',
  },
  statNumero: {
    fontSize: 26,
    color: '#00e054',
    fontWeight: 'bold',
  },
  statNumeroVerde: {
    fontSize: 26,
    color: '#40b540',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9ab',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  btnEncerrarSessao: {
    backgroundColor: '#ff494920',
    borderWidth: 1,
    borderColor: '#ff4949',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  btnEncerrarSessaoTexto: {
    color: '#ff4949',
    fontWeight: 'bold',
    fontSize: 14,
  },
});