import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/helpers';

const ObrasContext = createContext();

const ACTIONS = {
  LOAD_DATA: 'LOAD_DATA',
  ADD_OBRA: 'ADD_OBRA',
  UPDATE_OBRA: 'UPDATE_OBRA',
  DELETE_OBRA: 'DELETE_OBRA',
  ADD_FISCALIZACAO: 'ADD_FISCALIZACAO',
  UPDATE_FISCALIZACAO: 'UPDATE_FISCALIZACAO',
  DELETE_FISCALIZACAO: 'DELETE_FISCALIZACAO',
};

const obrasReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        obras: action.payload.obras || [],
        fiscalizacoes: action.payload.fiscalizacoes || [],
      };

    case ACTIONS.ADD_OBRA:
      return {
        ...state,
        obras: [...state.obras, action.payload],
      };

    case ACTIONS.UPDATE_OBRA:
      return {
        ...state,
        obras: state.obras.map(obra =>
          obra.id === action.payload.id ? action.payload : obra
        ),
      };

    case ACTIONS.DELETE_OBRA:
      return {
        ...state,
        obras: state.obras.filter(obra => obra.id !== action.payload),
        fiscalizacoes: state.fiscalizacoes.filter(fisc => fisc.obraId !== action.payload),
      };

    case ACTIONS.ADD_FISCALIZACAO:
      const novaFiscalizacao = {
        ...action.payload,
        id: generateUUID(),
        dataCriacao: new Date().toISOString(),
      };
      return {
        ...state,
        fiscalizacoes: [...state.fiscalizacoes, novaFiscalizacao],
      };

    case ACTIONS.UPDATE_FISCALIZACAO:
      return {
        ...state,
        fiscalizacoes: state.fiscalizacoes.map(fisc =>
          fisc.id === action.payload.id ? action.payload : fisc
        ),
      };

    case ACTIONS.DELETE_FISCALIZACAO:
      return {
        ...state,
        fiscalizacoes: state.fiscalizacoes.filter(fisc => fisc.id !== action.payload),
      };

    default:
      return state;
  }
};

const initialState = {
  obras: [],
  fiscalizacoes: [],
};

export const ObrasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(obrasReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [state]);

  const loadData = async () => {
    try {
      const obrasData = await AsyncStorage.getItem('@obras');
      const fiscalizacoesData = await AsyncStorage.getItem('@fiscalizacoes');
      
      const obras = obrasData ? JSON.parse(obrasData) : [];
      const fiscalizacoes = fiscalizacoesData ? JSON.parse(fiscalizacoesData) : [];
      
      dispatch({
        type: ACTIONS.LOAD_DATA,
        payload: { obras, fiscalizacoes }
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@obras', JSON.stringify(state.obras));
      await AsyncStorage.setItem('@fiscalizacoes', JSON.stringify(state.fiscalizacoes));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const adicionarObra = async (obra) => {
    const novaObra = {
      ...obra,
      id: generateUUID(),
      dataCriacao: new Date().toISOString(),
    };
    
    dispatch({
      type: ACTIONS.ADD_OBRA,
      payload: novaObra,
    });
    
    return novaObra;
  };

  const atualizarObra = async (obra) => {
    dispatch({
      type: ACTIONS.UPDATE_OBRA,
      payload: {
        ...obra,
        dataAtualizacao: new Date().toISOString(),
      },
    });
  };

  const excluirObra = async (obraId) => {
    dispatch({
      type: ACTIONS.DELETE_OBRA,
      payload: obraId,
    });
  };

  const adicionarFiscalizacao = async (fiscalizacao) => {
    dispatch({
      type: ACTIONS.ADD_FISCALIZACAO,
      payload: fiscalizacao,
    });
  };

  const atualizarFiscalizacao = async (fiscalizacao) => {
    dispatch({
      type: ACTIONS.UPDATE_FISCALIZACAO,
      payload: {
        ...fiscalizacao,
        dataAtualizacao: new Date().toISOString(),
      },
    });
  };

  const excluirFiscalizacao = async (fiscalizacaoId) => {
    dispatch({
      type: ACTIONS.DELETE_FISCALIZACAO,
      payload: fiscalizacaoId,
    });
  };

  const getFiscalizacoesPorObra = (obraId) => {
    return state.fiscalizacoes
      .filter(fisc => fisc.obraId === obraId)
      .sort((a, b) => new Date(b.dataFiscalizacao) - new Date(a.dataFiscalizacao));
  };

  const getEstatisticas = () => {
    const totalObras = state.obras.length;
    const totalFiscalizacoes = state.fiscalizacoes.length;
    
    const statusCount = { 'Em dia': 0, 'Atrasada': 0, 'Parada': 0, 'Sem fiscalização': 0 };
    
    state.obras.forEach(obra => {
      const fiscalizacoesObra = getFiscalizacoesPorObra(obra.id);
      if (fiscalizacoesObra.length > 0) {
        const ultimaFiscalizacao = fiscalizacoesObra[0];
        statusCount[ultimaFiscalizacao.status]++;
      } else {
        statusCount['Sem fiscalização']++;
      }
    });

    return {
      totalObras,
      totalFiscalizacoes,
      statusCount,
    };
  };

  const value = {
    obras: state.obras,
    fiscalizacoes: state.fiscalizacoes,
    
    adicionarObra,
    atualizarObra,
    excluirObra,
    
    adicionarFiscalizacao,
    atualizarFiscalizacao,
    excluirFiscalizacao,
    getFiscalizacoesPorObra,
    
    getEstatisticas,
    recarregarDados: loadData,
  };

  return (
    <ObrasContext.Provider value={value}>
      {children}
    </ObrasContext.Provider>
  );
};

export const useObras = () => {
  const context = useContext(ObrasContext);
  if (!context) {
    throw new Error('useObras deve ser usado dentro de um ObrasProvider');
  }
  return context;
};