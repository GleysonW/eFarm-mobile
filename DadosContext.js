import React, { createContext, useContext, useState } from 'react';

const DadosContext = createContext();

export const DadosProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [lucros, setLucros] = useState([]);

  const updateGastos = (novosGastos) => {
    setGastos(novosGastos);
  };

  const updateLucros = (novosLucros) => {
    setLucros(novosLucros);
  };

  return (
    <DadosContext.Provider value={{ gastos, updateGastos, lucros, updateLucros }}>
      {children}
    </DadosContext.Provider>
  );
};

export const useDados = () => {
  return useContext(DadosContext);
};