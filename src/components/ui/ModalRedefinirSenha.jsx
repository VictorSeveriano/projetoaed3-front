import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import authService from '../../services/auth.service';
import { TriangleAlert, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

/**
 * Regras de senha exibidas ao usuário durante a redefinição.
 */
const REGRAS_SENHA = [
  { id: 'min', label: 'Mínimo de 8 caracteres', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'Pelo menos uma letra maiúscula (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Pelo menos uma letra minúscula (a–z)', test: (v) => /[a-z]/.test(v) },
  { id: 'num', label: 'Pelo menos um número (0–9)', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'Pelo menos um caractere especial (!@#$%…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/**
 * ModalRedefinirSenha
 * Fluxo:
 *  1. IDENTIFICACAO — usuário informa login + CPF
 *  2. NOVA_SENHA    — usuário define nova senha + confirmação
 *  3. SUCESSO       — mensagem de confirmação
 */
const ModalRedefinirSenha = ({ isOpen, onClose }) => {
  const [etapa, setEtapa] = useState('IDENTIFICACAO');
  const [form, setForm] = useState({ usuario: '', cpf: '', novaSenha: '', confirmarSenha: '' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const reset = () => {
    setEtapa('IDENTIFICACAO');
    setForm({ usuario: '', cpf: '', novaSenha: '', confirmarSenha: '' });
    setErro('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleChange = (e) => {
    setErro('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── ETAPA 1: verificar identidade ── */
  const handleVerificarIdentidade = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.usuario.trim() || !form.cpf.trim()) {
      setErro('Preencha o login e o CPF.');
      return;
    }
    setLoading(true);
    try {
      await authService.verificarIdentidade(form.usuario.trim(), form.cpf.trim());
      setEtapa('NOVA_SENHA');
    } catch (err) {
      setErro(
        err.response?.data?.message ||
        'Dados inválidos. Verifique o login e o CPF informados.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── ETAPA 2: redefinir senha ── */
  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setErro('');

    const todasOk = REGRAS_SENHA.every((r) => r.test(form.novaSenha));
    if (!todasOk) {
      setErro('A nova senha não atende a todos os requisitos.');
      return;
    }
    if (form.novaSenha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authService.redefinirSenha(form.usuario.trim(), form.cpf.trim(), form.novaSenha);
      setEtapa('SUCESSO');
    } catch (err) {
      setErro(
        err.response?.data?.message ||
        'Não foi possível redefinir a senha. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Título dinâmico ── */
  const titulo =
    etapa === 'IDENTIFICACAO' ? 'Redefinir Senha'
    : etapa === 'NOVA_SENHA'   ? 'Criar Nova Senha'
    : 'Senha Redefinida';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titulo} size="sm">

      {/* ──────── ETAPA 1: Identificação ──────── */}
      {etapa === 'IDENTIFICACAO' && (
        <form onSubmit={handleVerificarIdentidade} noValidate>
          <p className="text-secondary" style={{ marginBottom: 20, lineHeight: 1.5 }}>
            Informe seu <strong>login</strong> e <strong>CPF</strong> cadastrados para
            verificar sua identidade.
          </p>

          <Input
            id="rs-usuario"
            name="usuario"
            label="Login (usuário)"
            required
            type="text"
            placeholder="Digite seu login"
            value={form.usuario}
            onChange={handleChange}
            autoComplete="username"
          />
          <Input
            id="rs-cpf"
            name="cpf"
            label="CPF"
            required
            type="text"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={handleChange}
            autoComplete="off"
          />

          {erro && (
            <div className="login-error" role="alert" style={{ marginTop: 8 }}>
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{erro}</span>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              <ShieldCheck size={16} aria-hidden="true" />
              Verificar Identidade
            </Button>
          </div>
        </form>
      )}

      {/* ──────── ETAPA 2: Nova Senha ──────── */}
      {etapa === 'NOVA_SENHA' && (
        <form onSubmit={handleRedefinirSenha} noValidate>
          <p className="text-secondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
            Identidade confirmada! Crie uma nova senha seguindo os requisitos abaixo.
          </p>

          {/* Checklist de regras */}
          <div className="senha-regras" style={{ marginBottom: 20 }}>
            {REGRAS_SENHA.map((r) => {
              const ok = r.test(form.novaSenha);
              return (
                <div
                  key={r.id}
                  className={`senha-regra ${ok ? 'senha-regra--ok' : 'senha-regra--pendente'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}
                >
                  <span
                    style={{
                      color: ok ? '#10b981' : 'var(--text-secondary, #94a3b8)',
                      flexShrink: 0,
                    }}
                  >
                    {ok ? <CheckCircle2 size={15} /> : <span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: '50%', border: '1.5px solid currentColor' }} />}
                  </span>
                  <span style={{ color: ok ? '#10b981' : 'var(--text-secondary, #94a3b8)' }}>
                    {r.label}
                  </span>
                </div>
              );
            })}
          </div>

          <Input
            id="rs-nova-senha"
            name="novaSenha"
            label="Nova Senha"
            required
            type="password"
            showPasswordToggle
            placeholder="Digite a nova senha"
            value={form.novaSenha}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <Input
            id="rs-confirmar-senha"
            name="confirmarSenha"
            label="Confirmar Nova Senha"
            required
            type="password"
            showPasswordToggle
            placeholder="Repita a nova senha"
            value={form.confirmarSenha}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {erro && (
            <div className="login-error" role="alert" style={{ marginTop: 8 }}>
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{erro}</span>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="ghost" onClick={() => { setEtapa('IDENTIFICACAO'); setErro(''); }} disabled={loading}>
              Voltar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              <KeyRound size={16} aria-hidden="true" />
              Redefinir Senha
            </Button>
          </div>
        </form>
      )}

      {/* ──────── ETAPA 3: Sucesso ──────── */}
      {etapa === 'SUCESSO' && (
        <div className="signup-success" style={{ textAlign: 'center', padding: '8px 0' }}>
          <div className="signup-success__icon" aria-hidden="true" style={{ marginBottom: 16 }}>
            <CheckCircle2 size={56} strokeWidth={1.75} style={{ color: '#10b981' }} />
          </div>
          <h3 className="signup-success__title" style={{ marginBottom: 8 }}>
            Senha Alterada com Sucesso!
          </h3>
          <p className="signup-success__desc" style={{ marginBottom: 24 }}>
            Sua senha foi redefinida. Use a nova senha na próxima vez que fizer login.
          </p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleClose}
          >
            Ir para o Login
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ModalRedefinirSenha;
