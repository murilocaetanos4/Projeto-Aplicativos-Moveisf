import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isCadastro: false,
      usuario: '',
      email: '',
      senha: '',
      carregando: false,
    };
  }

  // Função utilitária para vibração (ignora silenciosamente na Web)
  vibrar = (tipo = 'selection') => {
    if (Platform.OS === 'web') return;
    try {
      if (tipo === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (tipo === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      else Haptics.selectionAsync();
    } catch (e) {
      // Ignora falhas de haptics
    }
  };

  exibirAlerta = (titulo, mensagem, tipo = 'info', onConfirm = null) => {
    this.vibrar(tipo === 'danger' ? 'error' : tipo === 'success' ? 'success' : 'selection');

    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
      if (onConfirm) onConfirm();
    } else {
      Alert.alert(titulo, mensagem, [
        {
          text: 'OK',
          onPress: () => {
            if (onConfirm) onConfirm();
          },
        },
      ]);
    }
  };

  toggleModo = () => {
    this.vibrar('selection');
    this.setState((prevState) => ({
      isCadastro: !prevState.isCadastro,
      usuario: '',
      email: '',
      senha: '',
    }));
  };

  handleSubmit = async () => {
    const { isCadastro, usuario, email, senha } = this.state;
    const emailFormatado = email.trim().toLowerCase();

    if (!emailFormatado || !senha) {
      this.exibirAlerta('Atenção', 'Por favor, preencha o e-mail e a senha para continuar!');
      return;
    }

    if (isCadastro && !usuario.trim()) {
      this.exibirAlerta('Atenção', 'Preencha o nome de usuário para criar a sua conta!');
      return;
    }

    if (senha.length < 6) {
      this.exibirAlerta('Senha curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.setState({ carregando: true });

    try {
      const contasSalvas = await AsyncStorage.getItem('@gameboxd_accounts');
      let contas = contasSalvas ? JSON.parse(contasSalvas) : {};

      if (isCadastro) {
        if (contas[emailFormatado]) {
          this.setState({ carregando: false });
          this.exibirAlerta(
            'Conta já existente',
            'Já existe uma conta cadastrada com este e-mail. Faça login para continuar.',
            'info'
          );
          return;
        }

        const novoNome = usuario.trim();
        contas[emailFormatado] = { nome: novoNome, senha };
        
        await AsyncStorage.setItem('@gameboxd_accounts', JSON.stringify(contas));
        await AsyncStorage.setItem('@gameboxd_user', novoNome);
        await AsyncStorage.setItem('@gameboxd_saved_profile_name', novoNome);
        
        await AsyncStorage.setItem(`@gameboxd_backlog_${novoNome}`, JSON.stringify([]));
        await AsyncStorage.setItem(`@gameboxd_diario_${novoNome}`, JSON.stringify([]));

        this.setState({ carregando: false });
        this.exibirAlerta(
          'Conta Criada! 🎉',
          `Bem-vindo ao Gameboxd, ${novoNome}! Sua conta foi criada com sucesso.`,
          'success',
          () => {
            this.props.navigation.replace('MainTabs');
          }
        );
      } else {
        const contaEncontrada = contas[emailFormatado];

        if (!contaEncontrada) {
          this.setState({ carregando: false });
          this.exibirAlerta(
            'Conta não encontrada',
            'Não encontramos nenhuma conta com esse e-mail. Verifique os dados ou cadastre-se.',
            'danger'
          );
          return;
        }

        if (contaEncontrada.senha !== senha) {
          this.setState({ carregando: false });
          this.exibirAlerta(
            'Senha Incorreta ❌',
            'A senha digitada está incorreta. Tente novamente!',
            'danger'
          );
          return;
        }

        await AsyncStorage.setItem('@gameboxd_user', contaEncontrada.nome);
        this.setState({ carregando: false });
        this.vibrar('success');
        
        // Redireciona para o MainTabs (navegador com abas inferiores)
        this.props.navigation.replace('MainTabs');
      }
    } catch (e) {
      this.setState({ carregando: false });
      this.exibirAlerta('Erro', 'Ocorreu um erro ao aceder ao armazenamento de dados.');
    }
  };

  render() {
    const { isCadastro, usuario, email, senha, carregando } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.brandHeader}>
              <Text style={styles.brandLogo}>🎮</Text>
              <Text style={styles.title}>Gameboxd</Text>
              <Text style={styles.subtitle}>Sua agenda e diário de videogames</Text>
            </View>

            <View style={styles.formAuth}>
              {isCadastro && (
                <TextInput
                  style={styles.input}
                  placeholder="Nome de usuário"
                  placeholderTextColor="#678"
                  value={usuario}
                  onChangeText={(text) => this.setState({ usuario: text })}
                  autoCapitalize="none"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#678"
                value={email}
                onChangeText={(text) => this.setState({ email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Senha (mín. 6 caracteres)"
                placeholderTextColor="#678"
                value={senha}
                onChangeText={(text) => this.setState({ senha: text })}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.button, styles.btnPrimary, carregando && styles.buttonDisabled]}
                onPress={this.handleSubmit}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="#14181c" />
                ) : (
                  <Text style={styles.btnPrimaryText}>
                    {isCadastro ? 'Criar Conta' : 'Entrar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.authToggle}>
              <Text style={styles.toggleText}>
                {isCadastro ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              </Text>
              <TouchableOpacity onPress={this.toggleModo} style={styles.btnLink}>
                <Text style={styles.btnLinkText}>
                  {isCadastro ? 'Fazer Login' : 'Cadastre-se'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181c',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandLogo: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ab',
    marginTop: 4,
  },
  formAuth: {
    backgroundColor: '#1e232a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2c3440',
  },
  input: {
    backgroundColor: '#14181c',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2c3440',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnPrimary: {
    backgroundColor: '#00e054',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: '#14181c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  toggleText: {
    color: '#9ab',
    fontSize: 14,
  },
  btnLink: {
    marginLeft: 6,
  },
  btnLinkText: {
    color: '#00e054',
    fontWeight: 'bold',
    fontSize: 14,
  },
});