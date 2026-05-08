# 🚀 Como Hospedar o GouldPRO Master no Vercel

## 📋 Pré-requisitos

- Conta no GitHub (gratuita)
- Conta no Vercel (gratuita)

---

## 🎯 **OPÇÃO 1: Deploy Direto pelo Figma Make (Mais Rápido)**

### Passo 1: Baixar o Código

1. No Figma Make, clique no menu (três pontinhos)
2. Selecione **"Download project"** ou **"Export"**
3. Salve o arquivo ZIP no seu computador
4. Extraia o ZIP em uma pasta

### Passo 2: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `gouldpro-master`
3. Deixe como **Público**
4. **NÃO** marque "Add a README file"
5. Clique em **Create repository**

### Passo 3: Fazer Upload dos Arquivos

**Opção A - Via Interface Web (Mais Fácil):**

1. No repositório criado, clique em **"uploading an existing file"**
2. Arraste TODOS os arquivos da pasta extraída
3. No final da página, clique em **Commit changes**

**Opção B - Via GitHub Desktop:**

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. File → Add Local Repository → Escolha a pasta
4. Clique em "Publish repository"

**Opção C - Via Git (Se souber usar):**

```bash
cd pasta-do-projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/gouldpro-master.git
git push -u origin main
```

### Passo 4: Deploy no Vercel

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize o Vercel a acessar seus repositórios
4. Na dashboard, clique em **"Add New..."** → **"Project"**
5. Encontre o repositório `gouldpro-master`
6. Clique em **"Import"**
7. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build` (já configurado)
   - **Output Directory**: `dist` (já configurado)
8. Clique em **"Deploy"**

### Passo 5: Aguardar Deploy

- O Vercel vai instalar dependências e fazer build
- Leva cerca de 2-5 minutos
- Quando terminar, você verá: **"Congratulations! 🎉"**

### Passo 6: Copiar URL do Projeto

1. Clique em **"Continue to Dashboard"**
2. Você verá a URL do seu app, algo como:
   - `https://gouldpro-master.vercel.app`
3. **COPIE ESTA URL** completa

---

## 🔧 **OPÇÃO 2: Deploy via CLI do Vercel (Avançado)**

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Fazer Login

```bash
vercel login
```

### Passo 3: Deploy

```bash
cd /workspaces/default/code
vercel
```

Siga as instruções no terminal.

---

## 🔐 Configurar Google Drive com a Nova URL

Agora que você tem a URL do Vercel, precisa adicioná-la no Google Cloud Console:

### Passo 1: Atualizar URIs no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Menu: **APIs e serviços** → **Credenciais**
3. Clique no **lápis** ✏️ do seu Client ID OAuth
4. Em **URIs de redirecionamento autorizados**, adicione:

```
https://gouldpro-master.vercel.app
```

(Substitua pela SUA URL do Vercel)

5. Em **Origens JavaScript autorizadas**, adicione:

```
https://gouldpro-master.vercel.app
```

6. Clique em **SALVAR**

### Passo 2: Aguardar e Testar

1. Aguarde 2-3 minutos
2. Acesse sua URL do Vercel
3. Vá em **Config** → **Backup na Nuvem**
4. Configure Client ID e API Key
5. Clique em **Entrar com Google**
6. Deve funcionar! ✅

---

## 📱 URL Final do App

Após o deploy, seu app estará disponível em:

```
https://gouldpro-master.vercel.app
```

Você pode:
- ✅ Acessar de qualquer dispositivo
- ✅ Compartilhar com outras pessoas
- ✅ Usar Google Drive normalmente
- ✅ Receber atualizações automáticas (quando fizer push pro GitHub)

---

## 🎨 Personalizar Domínio (Opcional)

Se quiser um domínio personalizado tipo `meucriatorio.com`:

1. No Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Lembre de adicionar o novo domínio no Google Cloud Console também

---

## 🔄 Atualizações Futuras

Sempre que você fizer alterações:

1. Faça push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```

2. O Vercel detecta automaticamente e faz redeploy

Ou pelo GitHub:
1. Edite arquivos direto no GitHub
2. Commit changes
3. Vercel redeploya automaticamente

---

## ⚠️ Troubleshooting

### Build falhou no Vercel

**Erro comum:** `Module not found`

**Solução:**
1. Verifique se o `package.json` está no repositório
2. No Vercel, Settings → General → Node.js Version → Escolha v18.x

### App não carrega

**Solução:**
1. Verifique se o build terminou
2. Vá em Deployments → Último deployment → View Function Logs
3. Procure por erros

### Google Drive não funciona

**Solução:**
1. Certifique-se que adicionou a URL do Vercel no Google Cloud Console
2. Aguarde 2-3 minutos após adicionar
3. Limpe cache do navegador (Ctrl + Shift + Delete)

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas em qualquer passo, me avise que te ajudo!

---

✨ **Seu app estará online, gratuito, rápido e com Google Drive funcionando!**
