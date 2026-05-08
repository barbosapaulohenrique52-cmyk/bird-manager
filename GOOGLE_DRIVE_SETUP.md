# Guia de Configuração Google Drive API - GouldPRO Master

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Clique em "Selecionar projeto" (topo da página)
4. Clique em "NOVO PROJETO"
5. Nome do projeto: `GouldPRO Master`
6. Clique em "CRIAR"
7. Aguarde alguns segundos e selecione o projeto criado

## Passo 2: Ativar a API do Google Drive

1. No menu lateral, vá em: **APIs e serviços** > **Biblioteca**
2. Pesquise por: `Google Drive API`
3. Clique em **Google Drive API**
4. Clique em **ATIVAR**
5. Aguarde a ativação (alguns segundos)

## Passo 3: Criar Credenciais OAuth 2.0

### 3.1 Configurar Tela de Consentimento

1. No menu lateral: **APIs e serviços** > **Tela de consentimento OAuth**
2. Selecione: **Externo** (para uso pessoal)
3. Clique em **CRIAR**

4. Preencha as informações:
   - **Nome do app**: GouldPRO Master
   - **E-mail de suporte do usuário**: seu email
   - **Domínios autorizados**: deixe em branco por enquanto
   - **Informações de contato do desenvolvedor**: seu email
5. Clique em **SALVAR E CONTINUAR**

6. Em "Escopos" (Scopes):
   - Clique em **ADICIONAR OU REMOVER ESCOPOS**
   - Procure e selecione:
     - `https://www.googleapis.com/auth/drive.file` (Criar e editar seus próprios arquivos)
   - Clique em **ATUALIZAR**
   - Clique em **SALVAR E CONTINUAR**

7. Em "Usuários de teste":
   - Clique em **+ ADICIONAR USUÁRIOS**
   - Adicione seu email (o mesmo que usará para login)
   - Clique em **ADICIONAR**
   - Clique em **SALVAR E CONTINUAR**

8. Revise e clique em **VOLTAR PARA O PAINEL**

### 3.2 Criar Client ID OAuth

1. No menu lateral: **APIs e serviços** > **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS**
3. Selecione: **ID do cliente OAuth**

4. Configure:
   - **Tipo de aplicativo**: Aplicativo da Web
   - **Nome**: GouldPRO Master Web Client
   
5. **URIs de redirecionamento autorizados**:
   - Clique em **+ ADICIONAR URI**
   - Adicione: `http://localhost:5173` (para desenvolvimento)
   - Se já tiver o app hospedado, adicione a URL de produção também
   
6. Clique em **CRIAR**

7. **IMPORTANTE**: Aparecerá uma janela com:
   - ✅ **ID do cliente** (algo como: `123456789-abc...apps.googleusercontent.com`)
   - ✅ **Chave secreta do cliente** (algo como: `GOCSPX-...`)
   
   **COPIE E GUARDE ESTES VALORES!** Você precisará deles na configuração do app.

## Passo 4: Criar Chave de API (opcional, mas recomendado)

1. No menu: **APIs e serviços** > **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS**
3. Selecione: **Chave de API**
4. **COPIE A CHAVE** gerada (algo como: `AIza...`)
5. Clique em **RESTRINGIR CHAVE**
6. Em "Restrições de API":
   - Selecione: **Restringir chave**
   - Marque: ✅ Google Drive API
7. Clique em **SALVAR**

## Passo 5: Configurar no GouldPRO Master

Após obter as credenciais, você precisará configurá-las no aplicativo:

### Opção 1: Variáveis de Ambiente (Recomendado)

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=sua-api-key-aqui
```

### Opção 2: Configuração Direta no App

O app terá uma tela de configuração onde você poderá colar:
- Client ID
- API Key (opcional)

## Passo 6: Testar a Integração

1. Inicie o aplicativo
2. Clique em "Entrar com Google"
3. Autorize o app a acessar seu Google Drive
4. Faça um backup de teste
5. Verifique se o arquivo foi salvo no Google Drive

## Verificação de Sucesso

✅ Se tudo estiver correto, você verá:
- Botão "Entrar com Google" funcionando
- Autorização solicitada na primeira vez
- Backups sendo salvos em uma pasta "GouldPRO Backups" no Drive
- Opção de restaurar backups anteriores

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de redirecionamento no Google Cloud Console é exatamente a mesma que está rodando o app

### Erro: "Access blocked: This app's request is invalid"
- Certifique-se de que adicionou seu email como usuário de teste

### Erro: "API key not valid"
- Verifique se ativou a Google Drive API
- Verifique se a API Key está correta

## Links Úteis

- Google Cloud Console: https://console.cloud.google.com/
- Documentação Google Drive API: https://developers.google.com/drive/api/guides/about-sdk
- OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

## Próximos Passos

Após obter as credenciais, volte ao app e:
1. Cole o Client ID nas configurações
2. Faça login com sua conta Google
3. Autorize o acesso ao Drive
4. Comece a usar backup automático na nuvem!

---

**Observação**: Mantenha suas credenciais em segredo. Nunca compartilhe o Client Secret ou API Key publicamente.
