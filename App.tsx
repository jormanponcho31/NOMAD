import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  ScrollView,
  StyleSheet,
  Image
} from 'react-native';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type ResourceType = 'ejercicio' | 'guia' | 'video' | 'practica';

type Resource = {
  id: string;
  tipo: ResourceType;
  titulo: string;
  detalle: string;
  url?: string;
};

type Topic = {
  id: string;
  titulo: string;
  descripcion: string;
  recursos: Resource[];
};

type Level = 'basico' | 'intermedio' | 'avanzado';

type Subject = {
  id: string;
  nombre: string;
  color: string;
  niveles: Record<Level, Topic[]>;
};

type RootStackParamList = {
  Bienvenida: undefined;
  Materias: undefined;
  Nivel: { materia: Subject; nivel: Level };
  Recursos: { materia: Subject; topic: Topic };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

WebBrowser.maybeCompleteAuthSession();

const FACEBOOK_BLUE = '#1877F2';

const subjectsData: Subject[] = [
  {
    id: 'mat',
    nombre: 'Matemáticas',
    color: '#FF6B6B',
    niveles: {
      basico: [
        {
          id: 'arit',
          titulo: 'Aritmética',
          descripcion: 'Operaciones básicas y propiedades fundamentales',
          recursos: [
            {
              id: 'arit-v1',
              tipo: 'video',
              titulo: 'Sumas y restas',
              detalle: 'Video de YouTube: suma y resta paso a paso',
              url: 'https://www.youtube.com/playlist?list=PLBal9AttAE0seYE2VhPzFa9Dbx-JM8-im'
            }
          ]
        }
      ],
      intermedio: [
        {
          id: 'alg',
          titulo: 'Álgebra',
          descripcion: 'Ecuaciones lineales y factorización',
          recursos: [
            {
              id: 'alg-v1',
              tipo: 'video',
              titulo: 'Álgebra básica',
              detalle: 'Video de YouTube: introducción al álgebra',
              url: 'https://www.youtube.com/user/KhanAcademyEspanol/playlists'
            }
          ]
        }
      ],
      avanzado: [
        {
          id: 'geo',
          titulo: 'Geometría',
          descripcion: 'Teoremas y demostraciones',
          recursos: [
            {
              id: 'geo-v1',
              tipo: 'video',
              titulo: 'Triángulos y propiedades',
              detalle: 'Video de YouTube: geometría de triángulos',
              url: 'https://www.youtube.com/watch?v=t0jCKVufl7I'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'esp',
    nombre: 'Lengua y Literatura',
    color: '#4ECDC4',
    niveles: {
      basico: [
        {
          id: 'gram',
          titulo: 'Gramática',
          descripcion: 'Partes de la oración y reglas básicas',
          recursos: [
            {
              id: 'gram-g1',
              tipo: 'guia',
              titulo: 'Guía de gramática básica',
              detalle: 'Ejemplos y ejercicios',
              url: 'https://www.orimi.com/pdf-test.pdf'
            }
          ]
        }
      ],
      intermedio: [
        {
          id: 'lect',
          titulo: 'Comprensión lectora',
          descripcion: 'Estrategias de lectura y análisis',
          recursos: [
            {
              id: 'lect-v1',
              tipo: 'video',
              titulo: 'Estrategias de comprensión lectora',
              detalle: 'Video de YouTube: técnicas de comprensión',
              url: 'https://www.youtube.com/watch?v=lzDaBQP5V1o'
            }
          ]
        }
      ],
      avanzado: [
        {
          id: 'lit',
          titulo: 'Literatura',
          descripcion: 'Movimientos literarios y autores',
          recursos: [
            {
              id: 'lit-v1',
              tipo: 'video',
              titulo: 'Romanticismo en la literatura',
              detalle: 'Video de YouTube: definición y características',
              url: 'https://www.youtube.com/watch?v=BR4Qunhj5cw'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'cien',
    nombre: 'Ciencias',
    color: '#FFD93D',
    niveles: {
      basico: [
        {
          id: 'bio',
          titulo: 'Biología',
          descripcion: 'Células y organismos',
          recursos: [
            {
              id: 'bio-v1',
              tipo: 'video',
              titulo: 'Estructura de la célula',
              detalle: 'Video de YouTube en español',
              url: 'https://www.youtube.com/watch?v=_ejQaAsna3k'
            }
          ]
        }
      ],
      intermedio: [
        {
          id: 'qui',
          titulo: 'Química',
          descripcion: 'Tabla periódica y enlaces',
          recursos: [
            {
              id: 'qui-v1',
              tipo: 'video',
              titulo: 'Enlaces químicos',
              detalle: 'Video de YouTube: tipos de enlaces',
              url: 'https://www.youtube.com/watch?v=WnVFcnGvJ-Y'
            }
          ]
        }
      ],
      avanzado: [
        {
          id: 'fis',
          titulo: 'Física',
          descripcion: 'Cinemática y dinámica',
          recursos: [
            {
              id: 'fis-v1',
              tipo: 'video',
              titulo: 'Movimiento rectilíneo',
              detalle: 'Playlist de YouTube: MRU/MRUV',
              url: 'https://www.youtube.com/playlist?list=PLnotpXbCazbMnkni8dvSbYFgnUV2Tc5BC'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'ing',
    nombre: 'Inglés',
    color: '#3D5AFE',
    niveles: {
      basico: [
        {
          id: 'verbtoBe',
          titulo: 'Verb to be y vocabulario',
          descripcion: 'Gramática básica y vocabulario inicial',
          recursos: [
            {
              id: 'ing-v1',
              tipo: 'video',
              titulo: 'Verb to be explicado',
              detalle: 'Video de YouTube en español',
              url: 'https://www.youtube.com/watch?v=9p-_NhWuuZQ'
            }
          ]
        }
      ],
      intermedio: [
        {
          id: 'tenses',
          titulo: 'Tiempos verbales',
          descripcion: 'Present simple, continuous y past simple',
          recursos: [
            {
              id: 'ing-v2',
              tipo: 'video',
              titulo: 'Present Simple',
              detalle: 'Video con ejemplos',
              url: 'https://www.youtube.com/watch?v=N4NRus3d3zY'
            }
          ]
        }
      ],
      avanzado: [
        {
          id: 'reading',
          titulo: 'Lectura y comprensión',
          descripcion: 'Estrategias avanzadas de lectura',
          recursos: [
            {
              id: 'ing-v3',
              tipo: 'video',
              titulo: 'Listening & Reading',
              detalle: 'Estrategias prácticas',
              url: 'https://www.youtube.com/watch?v=P-qHRbIfzTg'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'geo2',
    nombre: 'Geografía',
    color: '#A0D468',
    niveles: {
      basico: [
        {
          id: 'mapas',
          titulo: 'Mapas y coordenadas',
          descripcion: 'Cartografía básica y sistema de coordenadas',
          recursos: [
            {
              id: 'geo2-v1',
              tipo: 'video',
              titulo: 'Introducción a la Geografía',
              detalle: 'Conceptos clave',
              url: 'https://www.youtube.com/watch?v=yoWZ9JITNDE'
            }
          ]
        }
      ],
      intermedio: [
        {
          id: 'clima',
          titulo: 'Clima y tiempo',
          descripcion: 'Elementos y factores del clima',
          recursos: [
            {
              id: 'geo2-v2',
              tipo: 'video',
              titulo: 'Mapas climáticos',
              detalle: 'Análisis de mapas',
              url: 'https://www.youtube.com/watch?v=1qEwCkIRbk8'
            }
          ]
        }
      ],
      avanzado: [
        {
          id: 'gis',
          titulo: 'Sistemas de Información Geográfica (GIS)',
          descripcion: 'Introducción a GIS y aplicaciones',
          recursos: [
            {
              id: 'geo2-v3',
              tipo: 'video',
              titulo: 'GIS para principiantes',
              detalle: 'Aplicaciones prácticas',
              url: 'https://www.youtube.com/watch?v=O2eZJwzJfDQ'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'bio2',
    nombre: 'Biología',
    color: '#6A4C93',
    niveles: {
      basico: [
        {
          id: 'celulas',
          titulo: 'Células y organelos',
          descripcion: 'Estructura y función de la célula',
          recursos: [
            {
              id: 'bio2-v1',
              tipo: 'video',
              titulo: 'Partes de la célula',
              detalle: 'Explicación visual',
              url: 'https://www.youtube.com/watch?v=_ejQaAsna3k'
            }
          ]
        }
      ],
      intermedio: [
        {
          id: 'genetica',
          titulo: 'Genética básica',
          descripcion: 'ADN, genes y herencia',
          recursos: [
            {
              id: 'bio2-v2',
              tipo: 'video',
              titulo: 'Introducción a la genética',
              detalle: 'Conceptos clave',
              url: 'https://www.youtube.com/watch?v=dfR486-4ERU'
            }
          ]
        }
      ],
      avanzado: [
        {
          id: 'evolucion',
          titulo: 'Evolución',
          descripcion: 'Evidencias y mecanismos evolutivos',
          recursos: [
            {
              id: 'bio2-v3',
              tipo: 'video',
              titulo: 'Evolución y selección natural',
              detalle: 'Explicación con ejemplos',
              url: 'https://www.youtube.com/watch?v=GhHOjC4oxh8'
            }
          ]
        }
      ]
    }
  }
];

function useFacebookAuth() {
  const envAny = process.env as any;
  const clientId = envAny.EXPO_PUBLIC_FACEBOOK_APP_ID || 'FACEBOOK_APP_ID';

  const discovery = {
    authorizationEndpoint: 'https://www.facebook.com/v17.0/dialog/oauth',
    tokenEndpoint: 'https://graph.facebook.com/v17.0/oauth/access_token'
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri: AuthSession.makeRedirectUri(),
      scopes: ['public_profile', 'email']
    },
    discovery
  );

  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      setUser({ name: 'Usuario de Facebook' });
    }
  }, [response]);

  return {
    request,
    user,
    login: () => promptAsync()
  };
}

function BienvenidaScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { request, user, login } = useFacebookAuth();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (user) {
      navigation.replace('Materias');
    }
  }, [user, navigation]);

  return (
    <LinearGradient colors={['#ffffff', '#e8f0fe']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nomad</Text>
        </View>
        <Animated.View style={[styles.welcome, { opacity: fadeAnim }]}>
          <Image source={require('./assets/nomad.png')} style={styles.logo} />
          <Text style={styles.welcomeTitle}>
            bienvenido a nomad, tu herramienta de aprendizaje
          </Text>
          <Pressable
            disabled={!request}
            onPress={login}
            style={({ pressed }) => [
              styles.fbButton,
              { opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Text style={styles.fbButtonText}>
              Continuar con Facebook
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.replace('Materias')}
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Text style={styles.secondaryButtonText}>Entrar como invitado</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MateriasScreen({ navigation }: any) {
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardsAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, [cardsAnim]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materias</Text>
      </View>
      <Animated.View style={{ flex: 1, opacity: cardsAnim }}>
        <FlatList
          contentContainerStyle={{ padding: 12 }}
          data={subjectsData}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('Nivel', { materia: item, nivel: 'basico' })
              }
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: item.color, opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubtitle}>
                  Selecciona nivel: Básico, Intermedio, Avanzado
                </Text>
                <View style={styles.levelRow}>
                  {(['basico', 'intermedio', 'avanzado'] as Level[]).map(
                    (lvl) => (
                      <Pressable
                        key={lvl}
                        onPress={() =>
                          navigation.navigate('Nivel', {
                            materia: item,
                            nivel: lvl
                          })
                        }
                        style={[
                          styles.levelPill,
                          { borderColor: item.color }
                        ]}
                      >
                        <Text style={[styles.levelText, { color: item.color }]}>
                          {lvl.toUpperCase()}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>
            </Pressable>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

function NivelScreen({ route, navigation }: any) {
  const { materia, nivel } = route.params as { materia: Subject; nivel: Level };
  const topics = materia.niveles[nivel];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {materia.nombre} · {nivel.toUpperCase()}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {topics.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => navigation.navigate('Recursos', { materia, topic: t })}
            style={({ pressed }) => [
              styles.topicCard,
              { borderLeftColor: materia.color, opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Text style={styles.topicTitle}>{t.titulo}</Text>
            <Text style={styles.topicDesc}>{t.descripcion}</Text>
            <Text style={styles.topicMeta}>
              {t.recursos.length} recursos disponibles
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecursosScreen({ route }: any) {
  const { materia, topic } = route.params as { materia: Subject; topic: Topic };
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isYouTube = (u?: string) => !!u && /(youtube\.com|youtu\.be)/i.test(u);

  async function downloadPdf(url: string | undefined, filename: string) {
    if (!url) return;
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    setDownloadingId(filename);
    const target = FileSystem.cacheDirectory + filename;
    try {
      const { uri } = await FileSystem.downloadAsync(url, target);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {materia.nombre} · {topic.titulo}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {topic.recursos.map((r) => (
          <View key={r.id} style={styles.resourceCard}>
            <Text style={[styles.resourceTitle, { color: materia.color }]}>
              {iconFor(r.tipo)} {r.titulo}
            </Text>
            <Text style={styles.resourceDetail}>{r.detalle}</Text>
            {r.tipo === 'video' && r.url ? (
              <Pressable
                onPress={() => WebBrowser.openBrowserAsync(r.url!)}
                style={({ pressed }) => [
                  styles.linkButton,
                  {
                    borderColor: materia.color,
                    backgroundColor: pressed ? '#f7f7f7' : '#fff'
                  }
                ]}
              >
                <Text style={[styles.linkText, { color: materia.color }]}>
                  Ver video
                </Text>
              </Pressable>
            ) : r.tipo === 'guia' ? (
              <View style={{ marginTop: 8 }}>
                <Pressable
                  onPress={() => {
                    if (r.url) WebBrowser.openBrowserAsync(r.url);
                  }}
                  style={({ pressed }) => [
                    styles.linkButton,
                    {
                      borderColor: materia.color,
                      backgroundColor: pressed ? '#f7f7f7' : '#fff'
                    }
                  ]}
                >
                  <Text style={[styles.linkText, { color: materia.color }]}>
                    Ver PDF
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => downloadPdf(r.url, `${r.id}.pdf`)}
                  style={({ pressed }) => [
                    styles.downloadButton,
                    {
                      borderColor: materia.color,
                      backgroundColor: pressed ? '#f7f7f7' : '#fff',
                      opacity: downloadingId === `${r.id}.pdf` ? 0.6 : 1
                    }
                  ]}
                >
                  <Text style={[styles.linkText, { color: materia.color }]}>
                    Descargar PDF
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  if (r.url) WebBrowser.openBrowserAsync(r.url);
                }}
                style={({ pressed }) => [
                  styles.linkButton,
                  {
                    borderColor: materia.color,
                    backgroundColor: pressed ? '#f7f7f7' : '#fff'
                  }
                ]}
              >
                <Text style={[styles.linkText, { color: materia.color }]}>
                  Ver detalles
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function iconFor(tipo: ResourceType) {
  switch (tipo) {
    case 'ejercicio':
      return '📝';
    case 'guia':
      return '📘';
    case 'video':
      return '🎬';
    case 'practica':
      return '✅';
    default:
      return '📚';
  }
}

export default function App() {
  const theme = useMemo(() => {
    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: FACEBOOK_BLUE,
        background: '#ffffff',
        card: '#ffffff',
        text: '#111111',
        border: '#e6e6e6',
        notification: FACEBOOK_BLUE
      }
    };
  }, []);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: FACEBOOK_BLUE },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#fff' }
        }}
      >
        <Stack.Screen
          name="Bienvenida"
          component={BienvenidaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Materias" component={MateriasScreen} />
        <Stack.Screen
          name="Nivel"
          component={NivelScreen}
          options={({ route }) => ({
            title: `${(route.params as any)?.materia?.nombre ?? 'Nivel'}`
          })}
        />
        <Stack.Screen name="Recursos" component={RecursosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: FACEBOOK_BLUE,
    justifyContent: 'center',
    paddingHorizontal: 16,
    elevation: 2
  },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
  welcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center', marginTop: 12, marginBottom: 16 },
  logo: { width: 120, height: 120, borderRadius: 24 },
  fbButton: {
    backgroundColor: FACEBOOK_BLUE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 1
  },
  fbButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6'
  },
  secondaryButtonText: { color: '#111', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 6,
    flexDirection: 'row',
    gap: 12,
    elevation: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardSubtitle: { fontSize: 13, color: '#555', marginTop: 4 },
  levelRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  levelPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  levelText: { fontSize: 12, fontWeight: '700' },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 6,
    elevation: 1
  },
  topicTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  topicDesc: { fontSize: 13, color: '#555', marginTop: 4 },
  topicMeta: { fontSize: 12, color: '#777', marginTop: 8 },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1
  },
  resourceTitle: { fontSize: 16, fontWeight: '700' },
  resourceDetail: { fontSize: 13, color: '#555', marginTop: 4 },
  playButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  playText: { fontWeight: '700' },
  video: { width: '100%', height: 200, backgroundColor: '#000', marginTop: 8 },
  linkButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  downloadButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  linkText: { fontWeight: '700' }
});
