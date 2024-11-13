import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Table, Row, Rows } from 'react-native-table-component';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, Dimensions, Image, Button, FlatList, ScrollView, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DadosProvider, useDados } from './DadosContext';
import axios from 'axios';

const API_URL_GASTOS = 'http://10.0.2.2:5500/api/gastos';
const API_URL_LUCROS = 'http://10.0.2.2:5500/api/lucros';
const logo = require('./assets/logo.png');

function HomeScreen() {
  const { gastos, lucros, updateGastos, updateLucros } = useDados();
  const [saldoInicial, setSaldoInicial] = useState(0);

  const totalGastos = (gastos || []).reduce((total, item) => total + parseFloat(item.valor), 0);
  const totalLucros = (lucros || []).reduce((total, item) => total + parseFloat(item.valor), 0);
  const saldoAtual = saldoInicial - totalGastos + totalLucros;
  const saldoAtualStyle = saldoAtual >= 0 ? stylesHOME.saldoPositivo : stylesHOME.saldoNegativo;

  const fetchGastos = async () => {
    try {
      const response = await axios.get(API_URL_GASTOS);
      updateGastos(response.data.gastos);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error.response ? error.response.data : error.message);
    }
  };

  const fetchLucros = async () => {
    try {
      const response = await axios.get(API_URL_LUCROS);
      updateLucros(response.data.lucros);
    } catch (error) {
      console.error('Erro ao buscar lucros:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchGastos();
    fetchLucros();
  }, []);

  return (
    <View style={stylesHOME.container}>
      <Text style={stylesHOME.titulo}>Bem vindo ao</Text>
      <Image source={logo} style={stylesHOME.logo2} />
      <Text style={stylesHOME.titulo}>Resumo Financeiro</Text>

      <View style={stylesHOME.saldoContainer}>
        <Text style={stylesHOME.saldoLabel}>Saldo Atual:</Text>
        <Text style={[stylesHOME.saldoValor, saldoAtualStyle]}>R$ {saldoAtual.toFixed(2)}</Text>
      </View>

      <View style={stylesHOME.section}>
        <Text style={stylesHOME.sectionTitle}>Últimos Gastos</Text>
        <FlatList
          data={gastos.slice(0, 3)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={stylesHOME.listItem}>
              <Text>{item.tipo} - R$ {item.valor} ({item.data})</Text>
            </View>
          )}
        />
      </View>

      <View style={stylesHOME.section}>
        <Text style={stylesHOME.sectionTitle}>Últimos Lucros</Text>
        <FlatList
          data={lucros.slice(0, 3)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={stylesHOME.listItem}>
              <Text>{item.tipo} - R$ {item.valor} ({item.data})</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const stylesHOME = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  logo2: {
    width: 300,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  saldoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  saldoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saldoValor: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saldoPositivo: {
    color: 'green',
  },
  saldoNegativo: {
    color: 'red',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    backgroundColor: '#FFF',
    marginBottom: 5,
    borderRadius: 5,
  },
});

function GraficosScreen() {
  const { gastos, lucros } = useDados();
  const [loading, setLoading] = useState(true);
  const [lineChartData, setLineChartData] = useState({
    labels: [], // O eixo X será vazio, sem mostrar a data
    datasets: [
      {
        data: [],
      },
    ],
  });
  const [barChartData, setBarChartData] = useState({
    labels: [], // Usado para os tipos de gasto, por exemplo
    datasets: [
      {
        data: [],
      },
    ],
  });
  const [lucroChartData, setLucroChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });

  useEffect(() => {
    const prepareChartData = () => {
      console.log("Dados recebidos para gráficos:", gastos, lucros);
  
      try {
        if (gastos && gastos.length > 0 && lucros && lucros.length > 0) {
          const datasGastos = gastos.map((item) => item.data);
          const valoresGastos = gastos.map((item) => Number(item.valor));
  
          const somaAcumuladaGastos = valoresGastos.reduce((acc, curr) => {
            const total = (acc.length > 0 ? acc[acc.length - 1] : 0) + curr;
            acc.push(total);
            return acc;
          }, []);
  
          setLineChartData({
            labels: [], // Ocultar as labels de data
            datasets: [
              {
                data: somaAcumuladaGastos,
              },
            ],
          });

          const tiposGastos = [...new Set(gastos.map((item) => item.tipo))];
          const valoresPorTipoGastos = tiposGastos.map(tipo =>
            gastos
              .filter(gasto => gasto.tipo === tipo)
              .reduce((sum, gasto) => sum + parseFloat(gasto.valor), 0)
          );

          setBarChartData({
            labels: tiposGastos,
            datasets: [
              {
                data: valoresPorTipoGastos,
              },
            ],
          });

          const datasLucros = lucros.map((item) => item.data);
          const valoresLucros = lucros.map((item) => Number(item.valor));

          const somaAcumuladaLucros = valoresLucros.reduce((acc, curr) => {
            const total = (acc.length > 0 ? acc[acc.length - 1] : 0) + curr;
            acc.push(total);
            return acc;
          }, []);

          setLucroChartData({
            labels: [], // Ocultar as labels de data
            datasets: [
              {
                data: somaAcumuladaLucros,
              },
            ],
          });
        } else {
          alert("Nenhum dado disponível.");
        }
      } catch (error) {
        console.error("Erro ao preparar dados do gráfico: ", error);
        alert("Erro ao preparar dados do gráfico.");
      } finally {
        setLoading(false);
      }
    };

    prepareChartData();
  }, [gastos, lucros]);

  return (
    <ScrollView>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Gráfico de Gastos</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <>
            <LineChart
              data={lineChartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: 'black',
                backgroundGradientFrom: 'black',
                backgroundGradientTo: 'black',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: 'red',
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />

            <Text style={{ marginTop: 20 }}>Gráfico de Lucros</Text>

            <LineChart
              data={lucroChartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: 'black',
                backgroundGradientFrom: 'black',
                backgroundGradientTo: 'black',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#00FF00',
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />

            <Text style={{ marginTop: 20 }}>Gráfico de Atividades/Gasto</Text>

            <BarChart
              data={barChartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: 'black',
                backgroundGradientFrom: 'black',
                backgroundGradientTo: 'black',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              verticalLabelRotation={0}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />

            <Text style={{ marginTop: 20 }}>Gráfico de Atividades/Lucro</Text>

            <BarChart
              data={{
                labels: [...new Set(lucros.map((item) => item.tipo))],
                datasets: [
                  {
                    data: [...new Set(lucros.map((item) => 
                      lucros.filter(lucro => lucro.tipo === item.tipo)
                      .reduce((sum, lucro) => sum + parseFloat(lucro.valor), 0))
                    )],
                  },
                ],
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: 'black',
                backgroundGradientFrom: 'black',
                backgroundGradientTo: 'black',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(124, 252, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              verticalLabelRotation={0}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const RegistroScreen = () => {
  const { updateGastos, updateLucros } = useDados();
  const [gastos, setGastos] = useState([]);
  const [lucros, setLucros] = useState([]);
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [editingGasto, setEditingGasto] = useState(null);
  const [editingLucro, setEditingLucro] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isGasto, setIsGasto] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const fetchGastos = async () => {
    try {
      const response = await axios.get(API_URL_GASTOS);
      setGastos(response.data.gastos);
      updateGastos(response.data.gastos);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error.response ? error.response.data : error.message);
    }
  };

  const fetchLucros = async () => {
    try {
      const response = await axios.get(API_URL_LUCROS);
      setLucros(response.data.lucros);
      updateLucros(response.data.lucros);
    } catch (error) {
      console.error('Erro ao buscar lucros:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchGastos();
    fetchLucros();
  }, []);

  const addGasto = async () => {
    try {
      await axios.post(API_URL_GASTOS, { tipo, valor, data });
      resetForm();
      fetchGastos();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
    }
  };

  const addLucro = async () => {
    try {
      await axios.post(API_URL_LUCROS, { tipo, valor, data });
      resetForm();
      fetchLucros();
    } catch (error) {
      console.error('Erro ao adicionar lucro:', error);
    }
  };

  const updateGasto = async () => {
    try {
      await axios.put(`${API_URL_GASTOS}/${editingGasto.id}`, { tipo, valor, data });
      resetForm();
      fetchGastos();
    } catch (error) {
      console.error('Erro ao atualizar gasto:', error);
    }
  };

  const updateLucro = async () => {
    try {
      await axios.put(`${API_URL_LUCROS}/${editingLucro.id}`, { tipo, valor, data });
      resetForm();
      fetchLucros();
    } catch (error) {
      console.error('Erro ao atualizar lucro:', error);
    }
  };

  const deleteGasto = async (gastoId) => {
    try {
      await axios.delete(`${API_URL_GASTOS}/${gastoId}`);
      fetchGastos();
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
    }
  };

  const deleteLucro = async (lucroId) => {
    try {
      await axios.delete(`${API_URL_LUCROS}/${lucroId}`);
      fetchLucros();
    } catch (error) {
      console.error('Erro ao excluir lucro:', error);
    }
  };

  const editGasto = (gasto) => {
    setTipo(gasto.tipo);
    setValor(gasto.valor.toString());
    setData(gasto.data);
    setEditingGasto(gasto);
    setIsGasto(true);
    setModalVisible(true);
  };

  const editLucro = (lucro) => {
    setTipo(lucro.tipo);
    setValor(lucro.valor.toString());
    setData(lucro.data);
    setEditingLucro(lucro);
    setIsGasto(false);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTipo('');
    setValor('');
    setData('');
    setEditingGasto(null);
    setEditingLucro(null);
    setModalVisible(false);
  };

  const formatDateToBR = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${
      (date.getMonth() + 1).toString().padStart(2, '0')
    }/${date.getFullYear()}`;
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
    setData(formatDateToBR(currentDate)); // Atualiza a data com o formato brasileiro
  };

  const totalGastos = gastos.reduce((total, item) => total + parseFloat(item.valor), 0);
  const totalLucros = lucros.reduce((total, item) => total + parseFloat(item.valor), 0);
  const saldoAtual = saldoInicial - totalGastos + totalLucros;
  const saldoAtualStyle = saldoAtual >= 0 ? styles.saldoPositivo : styles.saldoNegativo;

  const saldoTableHead = ['Descrição', 'Valor'];
  const saldoTableData = [
    ['Saldo Atual', <Text style={saldoAtualStyle}>${saldoAtual.toFixed(2)}</Text>],
  ];

  const renderGastosTable = () => (
    <View style={styles.tableContainer}>
      <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
        <Row data={['Tipo', 'Valor', 'Data', 'Editar', 'Excluir']} style={styles.header} textStyle={styles.headerText} />
        <Rows data={gastos.map(item => [
          <Text style={styles.cellText}>{item.tipo}</Text>,
          <Text style={styles.cellText}>{item.valor}</Text>,
          <Text style={styles.cellText}>{item.data}</Text>,
          <TouchableOpacity style={styles.button} onPress={() => editGasto(item)}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>,
          <TouchableOpacity style={styles.button} onPress={() => {
            Alert.alert('Excluir Gasto', 'Tem certeza que deseja excluir este gasto?', [
              { text: 'Cancelar' },
              { text: 'Excluir', onPress: () => deleteGasto(item.id) }
            ]);
          }}>
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        ])} />
      </Table>
    </View>
  );

  const renderLucrosTable = () => (
    <View style={styles.tableContainer}>
      <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
        <Row data={['Tipo', 'Valor', 'Data', 'Editar', 'Excluir']} style={styles.header} textStyle={styles.headerText} />
        <Rows data={lucros.map(item => [
          <Text style={styles.cellText}>{item.tipo}</Text>,
          <Text style={styles.cellText}>{item.valor}</Text>,
          <Text style={styles.cellText}>{item.data}</Text>,
          <TouchableOpacity style={styles.button} onPress={() => editLucro(item)}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>,
          <TouchableOpacity style={styles.button} onPress={() => {
            Alert.alert('Excluir Lucro', 'Tem certeza que deseja excluir este lucro?', [
              { text: 'Cancelar' },
              { text: 'Excluir', onPress: () => deleteLucro(item.id) }
            ]);
          }}>
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        ])} />
      </Table>
    </View>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Registro de Gastos e Lucros</Text>

        <View style={styles.tableContainer}>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
            <Row data={saldoTableHead} style={styles.header} textStyle={styles.headerText} />
            <Rows data={saldoTableData.map(row => row.map(item => 
              typeof item === 'string' ? <Text style={styles.cellText}>{item}</Text> : item
            ))} />
          </Table>
        </View>

        <View style={styles.buttonContainer}>
        <Button title="Adicionar Gasto" onPress={() => { setIsGasto(true); setModalVisible(true); }} />
        <Button title="Adicionar Lucro" onPress={() => { setIsGasto(false); setModalVisible(true); }} />
        </View>
        <Text style={styles.text}>Gastos</Text>
        {renderGastosTable()}
        <Text style={styles.text}>Lucros</Text>
        {renderLucrosTable()}

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>{isGasto ? (editingGasto ? "Editar Gasto" : "Adicionar Gasto") : (editingLucro ? "Editar Lucro" : "Adicionar Lucro")}</Text>
            <Text>Tipo:</Text>
      <Picker
        selectedValue={tipo}
        style={styles.input}
        onValueChange={(itemValue) => setTipo(itemValue)}
      >
        <Picker.Item label="Escolha o tipo" value="" />
        <Picker.Item label="Insumos" value="Insumos" />
        <Picker.Item label="Transporte" value="Transporte" />
        <Picker.Item label="Vendas" value="Vendas" />
        <Picker.Item label="Outro" value="Outro" />
      </Picker>
      <TextInput style={styles.input} placeholder="Valor" keyboardType="numeric" value={valor} onChangeText={setValor} />
      
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Data"
          value={data}
          editable={false}
        />
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}

      <Button 
        title={editingGasto || editingLucro ? "Salvar" : "Adicionar"}
        onPress={isGasto ? (editingGasto ? updateGasto : addGasto) : (editingLucro ? updateLucro : addLucro)}
      />
      <Button title="Cancelar" onPress={resetForm} />
    </View>
  </View>
</Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  saldoContainer: {
    marginBottom: 20,
  },
  saldoLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  tableContainer: {
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#f1f1f1',
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  cellText: {
    textAlign: 'center',
    padding: 10,
  },
  text: {
    padding:  10,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
  },
  buttonContainer: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  saldoPositivo: {
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  saldoNegativo: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DadosProvider>
      <NavigationContainer>
      <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home-sharp' : 'home-outline';
              } else if (route.name === 'Gráficos') {
                iconName = focused ? 'bar-chart-sharp' : 'bar-chart-outline';
              } else if (route.name === 'Registros') {
                iconName = focused ? 'document-text-sharp' : 'document-text-outline';
              }
              return <Icon name={iconName} size={30} color={focused ? 'red' : '#000'} />;
            },
            tabBarActiveTintColor: 'red',
            tabBarInactiveTintColor: '#000',
            tabBarStyle: { backgroundColor: '#FFFFFF' },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={logo}
                  style={{ width: 100, height: 100, resizeMode: 'contain' }}
                />
              ),
              headerTitleAlign: 'left',
            }}
          />
          <Tab.Screen
            name="Gráficos"
            component={GraficosScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={logo}
                  style={{ width: 100, height: 100, resizeMode: 'contain' }}
                />
              ),
              headerTitleAlign: 'left',
            }}
          />
          <Tab.Screen
            name="Registros"
            component={RegistroScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={logo}
                  style={{ width: 100, height: 100, resizeMode: 'contain' }}
                />
              ),
              headerTitleAlign: 'left',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DadosProvider>
  );
}