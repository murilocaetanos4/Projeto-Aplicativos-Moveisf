import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const JOGOS_EM_DESTAQUE = [
  {
    id: '1',
    titulo: 'Crow Country',
    ano: 2024,
    nota: 4.8,
    imagem: 'https://m.media-amazon.com/images/M/MV5BMzZhM2ZmNTEtZjFiZS00NGJkLTkxOWItYjlhMzAxZTYwZmIzXkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg',
    descricao: 'O ano é 1990. Já se passaram dois anos desde o misterioso desaparecimento de Edward Crow...',
  },
  {
    id: '2',
    titulo: 'Bloons TD 6',
    ano: 2018,
    nota: 4.9,
    imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcqAM3mQOxBrCX9Wh2YqP5_qr1H7T6ErWpEr9rW7o7iTlGmN0532KVJHI&s=10',
    descricao: 'Incrível Jogo de Defesa de Torres',
  },
  {
    id: '3',
    titulo: 'Cyberpunk 2077',
    ano: 2020,
    nota: 4.2,
    imagem: 'https://image.api.playstation.com/vulcan/ap/rnd/202008/0416/6Bo40lnWU0BhgrOUm7Cb6by3.png',
    descricao: 'Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto que se passa em Night City...',
  },
  {
    id: '4',
    titulo: 'Hollow Knight',
    ano: 2017,
    nota: 4.7,
    imagem: 'https://store-images.s-microsoft.com/image/apps.58959.13847644057609868.8865d2a2-5e11-4424-85ce-1db30a161bd9.41ca3834-331c-4d34-b2c9-7dfe318fd168',
    descricao: 'Forje seu caminho em Hollow Knight! Uma aventura de ação épica em um vasto reino arruinado...',
  },
  {
    id: '5',
    titulo: 'REANIMAL',
    ano: 2025,
    nota: 4.8,
    imagem: 'https://cdn1.epicgames.com/offer/099a5ae11e914547af1c0cca4c9ffde2/EGS_REANIMAL_TarsierStudios_S2_1200x1600-a46513d4ef10fe0a339929f47db71ac9',
    descricao: 'Os criadores de Little Nightmares™ I & II retornam para trazer uma jornada aterrorizante e sombria...',
  },
  {
    id: '6',
    titulo: 'Dead Estate',
    ano: 2021,
    nota: 5,
    imagem: 'https://m.media-amazon.com/images/M/MV5BNWVmOWMyOTUtYjJmZi00MmU2LWExOGItMGI1MWZkZGQzNTgyXkEyXkFqcGc@._V1_.jpg',
    descricao: 'Apressado e sem ter para onde fugir, conseguirás escapar da mansão repleta de monstros?...',
  },
  {
    id: '7',
    titulo: 'Costume Quest',
    ano: 2011,
    nota: 4.4,
    imagem: 'https://thumb.wikimedia.org/wikipedia/pt/thumb/d/de/Costume-quest-cover.jpg/250px-Costume-quest-cover.jpg?utm_source=pt.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    descricao: 'Uma aventura de Halloween de Tim Schafers Double Fine Productions.',
  },
  {
    id: '8',
    titulo: 'Resident Evil 2',
    ano: 2019,
    nota: 4.9,
    imagem: 'https://store-images.s-microsoft.com/image/apps.36567.71571739681700792.c61fa2d7-3d69-4edf-8e51-accc41d47823.a8c614fc-0dcb-4788-89ed-958635753296',
    descricao: '"30 de setembro de 1998. É um dia que eu nunca vou esquecer."...',
  },
  {
    id: '9',
    titulo: 'TOEM',
    ano: 2021,
    nota: 4.7,
    imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJous3a7z6N3H5_7Lg0y0RVf9jismOqCottd2qegpZbExEuu_rn4vd_x2D&s=10',
    descricao: 'Parta em uma agradável expedição e use seu olhar fotográfico para desvendar os mistérios...',
  },
  {
    id: '10',
    titulo: 'Little Nightmares II',
    ano: 2021,
    nota: 4.9,
    imagem: 'https://store-images.s-microsoft.com/image/apps.1273.64860558234786024.c6d17f3a-2d73-46e6-8a1e-c828e528d51f.c0546c16-c1b2-4f91-921f-762c88c3ab54',
    descricao: 'Little Nightmares II é uma aventura de suspense em que se controla Mono...',
  },
  {
    id: '11',
    titulo: 'Hello Kitty Island Adventure',
    ano: 2025,
    nota: 5,
    imagem: 'https://image.api.playstation.com/vulcan/ap/rnd/202506/2403/ff065fe144241822c5c33011911f961ea113161a42472356.png',
    descricao: 'Embarque numa aventura aconchegante de mundo aberto com Hello Kitty e Amigos...',
  },
  {
    id: '12',
    titulo: 'South Park stick of truth',
    ano: 2025,
    nota: 4.5,
    imagem: 'https://upload.wikimedia.org/wikipedia/pt/7/70/The_Stick_of_Truth.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=original',
    descricao: 'Das perigosas batalhas do parque infantil da quarta série, um jovem herói surgirá...',
  },
  {
    id: '13',
    titulo: 'Lego Batman 3: Beyond Gotham',
    ano: 2014,
    nota: 4.5,
    imagem: 'https://image.api.playstation.com/cdn/EP1018/CUSA00578_00/lb6Z331TkcXCtDU6U5qnH9zNz3Uc9ayl.png',
    descricao: 'O Cavaleiro das Trevas une forças com os super-heróis do universo DC Comics...',
  },
  {
    id: '14',
    titulo: 'METAL SLUG',
    ano: 1996,
    nota: 4.9,
    imagem: 'https://cdn.mobygames.com/covers/6866945-metal-slug-super-vehicle-001-neo-geo-cd-front-cover.jpg',
    descricao: '"METAL SLUG", o primeiro título da lendária série de jogos de tiro e ação 2D...',
  },
  {
    id: '15',
    titulo: 'BALL x PIT',
    ano: 2025,
    nota: 5,
    imagem: 'https://imgproxy.eneba.games/bcrTGmv8BM-qtB3Bgn3VOnv0XzoccX4xZU81M2aUpBY/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy92/YkJWTkZEOG55eEpy/ZU1NeWM5bGxKMDg1/NG96WGhBZmgyV1N1/clA4VGQ4LmpwZw',
    descricao: 'BALL x PIT é um roguelite de sobrevivência e de quebrar blocos...',
  },
  {
    id: '16',
    titulo: 'Hades II',
    ano: 2025,
    nota: 4.9,
    imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuhoL2GmdD9B_RcwLMyS5sd59XwnDf5_SEW2bX6HEEtKa6-S9jG-KPhkts&s=10',
    descricao: 'Transcenda o Submundo com feitiços das trevas para enfrentar o titã do tempo...',
  },
  {
    id: '17',
    titulo: 'Bayonetta',
    ano: 2017,
    nota: 4.7,
    imagem: 'https://static.wikia.nocookie.net/bayonetta/images/9/9f/Bayonetta1_HD2009Cover.jpg/revision/latest/scale-to-width-down/250?cb=20200311020905',
    descricao: 'O obra-prima de ação universalmente aclamada da PlatinumGames finalmente chega ao PC...',
  },
  {
    id: '18',
    titulo: 'THE KING OF FIGHTERS 97 GLOBAL MATCH',
    ano: 2018,
    nota: 4.8,
    imagem: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co1uei.jpg',
    descricao: 'KOF 97 é o capítulo final da Saga Orochi, enredo original da série KOF...',
  },
];

export default function HomeScreen({ navigation }) {
  const [usuario, setUsuario] = useState('Jogador');

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const nomeSalvo = await AsyncStorage.getItem('@gameboxd_user');
      if (nomeSalvo) {
        setUsuario(nomeSalvo);
      }
    } catch (error) {
      console.log('Erro ao carregar o nome do utilizador:', error);
    }
  };

  const vibrar = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {}
    }
  };

  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
    try {
      await AsyncStorage.removeItem('@gameboxd_user');
      navigation.replace('Login');
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    }
  };

  const renderCardJogo = ({ item }) => (
    <TouchableOpacity
      style={styles.cardJogo}
      activeOpacity={0.8}
      onPress={() => {
        vibrar();
        navigation.navigate('Detalhes', { jogo: item });
      }}
    >
      <View style={styles.capaContainer}>
        <Image
          source={{ uri: item.imagem }}
          style={styles.capa}
          resizeMode="cover"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.titulo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.ano}>{item.ano}</Text>
          <Text style={styles.nota}>★ {item.nota}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14181c" />

      <View style={styles.contentWrapper}>
        {/* Header superior */}
        <View style={styles.navbar}>
          <View style={styles.navBrand}>
            <Text style={styles.brandLogo}>🎮</Text>
            <Text style={styles.brandTitle}>Gameboxd</Text>
          </View>
          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
            <Text style={styles.btnLogoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de jogos */}
        <FlatList
          data={JOGOS_EM_DESTAQUE}
          keyExtractor={(item) => item.id}
          renderItem={renderCardJogo}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.banner}>
              <Text style={styles.boasVindas}>Olá, {usuario}! 👋</Text>
              <Text style={styles.subtitulo}>
                Acompanha os teus jogos. Guarda as tuas análises e organiza a tua fila de jogatinas.
              </Text>
              <Text style={styles.sectionTitle}>Jogos em Destaque</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181c',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3440',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  btnLogout: {
    backgroundColor: '#2c3440',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnLogoutText: {
    color: '#ff4949',
    fontWeight: 'bold',
    fontSize: 13,
  },
  banner: {
    paddingVertical: 16,
  },
  boasVindas: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitulo: {
    fontSize: 13,
    color: '#99aabb',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00e054',
    marginTop: 18,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 14,
  },
  cardJogo: {
    flex: 1,
    backgroundColor: '#1e232a',
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2c3440',
  },
  capaContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#101418',
  },
  capa: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 10,
  },
  titulo: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  meta: {
    flexDirection: 'row',
    justifycontent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  ano: {
    color: '#667788',
    fontSize: 12,
  },
  nota: {
    color: '#00e054',
    fontSize: 12,
    fontWeight: 'bold',
  },
});