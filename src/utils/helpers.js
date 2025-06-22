export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getObraStatus = (dataInicio, previsaoTermino) => {
  const hoje = new Date();
  const inicio = new Date(dataInicio);
  const termino = new Date(previsaoTermino);
  
  if (hoje < inicio) {
    return 'Não iniciada';
  } else if (hoje > termino) {
    return 'Atrasada';
  } else {
    return 'Em andamento';
  }
};

export const getDiasRestantes = (previsaoTermino) => {
  const hoje = new Date();
  const termino = new Date(previsaoTermino);
  const diffTime = termino - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Em dia':
      return '#4CAF50';
    case 'Atrasada':
      return '#F44336';
    case 'Parada':
      return '#FF9800';
    case 'Em andamento':
      return '#2196F3';
    case 'Não iniciada':
      return '#9E9E9E';
    default:
      return '#757575';
  }
};

export const validateObra = (obra) => {
  const errors = {};
  
  if (!obra.nome || obra.nome.trim() === '') {
    errors.nome = 'Nome da obra é obrigatório';
  }
  
  if (!obra.responsavel || obra.responsavel.trim() === '') {
    errors.responsavel = 'Responsável é obrigatório';
  }
  
  if (!obra.dataInicio) {
    errors.dataInicio = 'Data de início é obrigatória';
  }
  
  if (!obra.previsaoTermino) {
    errors.previsaoTermino = 'Previsão de término é obrigatória';
  }
  
  if (obra.dataInicio && obra.previsaoTermino) {
    const inicio = new Date(obra.dataInicio);
    const termino = new Date(obra.previsaoTermino);
    
    if (termino <= inicio) {
      errors.previsaoTermino = 'Previsão de término deve ser posterior à data de início';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFiscalizacao = (fiscalizacao) => {
  const errors = {};
  
  if (!fiscalizacao.dataFiscalizacao) {
    errors.dataFiscalizacao = 'Data da fiscalização é obrigatória';
  }
  
  if (!fiscalizacao.status) {
    errors.status = 'Status é obrigatório';
  }
  
  if (!fiscalizacao.observacoes || fiscalizacao.observacoes.trim() === '') {
    errors.observacoes = 'Observações são obrigatórias';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};