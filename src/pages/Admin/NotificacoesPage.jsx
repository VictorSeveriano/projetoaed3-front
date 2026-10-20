import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ModalErro from '../../components/ui/ModalErro';
import { Bell, Check } from 'lucide-react';
import { formatarDataHorario } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import notificacoesService from '../../services/notificacoes.service';

const NotificacoesPage = () => {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });
  const navigate = useNavigate();

  const exibirErro = useCallback((err, mensagemPadrao) => {
    setErroModal({
      aberto: true,
      titulo: 'Erro',
      mensagem: err?.response?.data?.message || mensagemPadrao,
    });
  }, []);

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const dados = await notificacoesService.listar();
      setNotificacoes(dados?.notificacoes || []);
    } catch (err) {
      exibirErro(err, 'Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  }, [usuario?.id, exibirErro]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleLerTodas = async () => {
    try {
      await notificacoesService.lerTodas();
      await carregar();
      window.dispatchEvent(new Event('notificacoes-atualizadas'));
    } catch (err) {
      exibirErro(err, 'Não foi possível marcar todas as notificações como lidas.');
    }
  };

  const handleNotificacaoClick = async (n) => {
    if (!n.lida) {
      try {
        await notificacoesService.ler(n.id);
        window.dispatchEvent(new Event('notificacoes-atualizadas'));
        await carregar();
      } catch (err) {
        exibirErro(err, 'Não foi possível marcar a notificação como lida.');
        return;
      }
    }
    if (n.tipo === 'SOLICITACAO_MOTORISTA') navigate('/motoristas/analise');
    if (n.tipo === 'SOLICITACAO_VEICULO') navigate('/veiculos/analise');
  };

  return (
    <div className="page animate-fade-in">
      <Header 
        title="Notificações" 
        subtitle="Mantenha-se atualizado sobre as atividades do sistema"
        actions={
          notificacoes.some(n => !n.lida) && (
            <Button onClick={handleLerTodas} variant="ghost" size="sm">
              <Check size={16} style={{ marginRight: '4px' }} />
              Marcar todas como lidas
            </Button>
          )
        }
      />

      {loading ? (
        <Loading message="Carregando notificações..." />
      ) : notificacoes.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} strokeWidth={1.5} />}
          title="Nenhuma notificação"
          description="Você não tem nenhuma notificação no momento."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
          {notificacoes.map((n) => (
            <div 
              key={n.id} 
              className={`card ${!n.lida ? 'notificacao-nao-lida' : ''}`}
              style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: !n.lida ? '4px solid var(--primary-color)' : 'none' }}
              onClick={() => handleNotificacaoClick(n)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontWeight: !n.lida ? 600 : 400 }}>{n.titulo}</h4>
                  {!n.lida && <Badge label="Nova" color="primary" />}
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{n.mensagem}</p>
                <small style={{ color: 'var(--text-muted)' }}>{formatarDataHorario(n.criadaEm)}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={() => setErroModal(prev => ({ ...prev, aberto: false }))}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />
    </div>
  );
};

export default NotificacoesPage;
