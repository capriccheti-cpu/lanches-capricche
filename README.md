# Estação de Lanches · Capricche

Painel web (single page) que exibe, em tempo real, o status de abastecimento das Estações de Lanches da Capricche — quem abasteceu, quando, e quais biscoitos estão disponíveis em cada pote.

Feito para ser aberto no celular (via QR code fixado na estação) ou em um monitor no setor: quem olha a tela entende imediatamente o que está vendo.

## Estrutura do projeto

```
├── index.html                  Página principal (apenas HTML)
├── logo_capricche.png          Logo oficial "Capricche é Show!"
├── favicon.png                 Favicon 64×64 (gerado a partir do logo)
├── apple-touch-icon.png        Ícone 180×180 para iOS/Android
└── assets/
    ├── css/
    │   ├── 81aec61e.css        Todo o estilo da página
    │   └── index.html          Redirecionamento (anti-listagem de pasta)
    ├── js/
    │   ├── 55a1a2d5.js         Toda a lógica da página
    │   └── index.html          Redirecionamento (anti-listagem de pasta)
    └── index.html              Redirecionamento (anti-listagem de pasta)
```

Os arquivos de CSS e JS usam nomes hexadecimais aleatórios de 32 bits, e cada pasta contém um `index.html` que redireciona para a página principal — evitando que alguém liste o conteúdo dos diretórios acessando a URL da pasta.

## Como funciona

1. A página busca o arquivo `abastecimento.json` publicado no repositório GitHub:
   `https://raw.githubusercontent.com/capriccheti-cpu/lanches-capricche/main/abastecimento.json`
2. O setor exibido é definido pelo parâmetro de URL `?setor=` (padrão: `ADM`):
   ```
   index.html?setor=ADM
   index.html?setor=PRODUCAO
   ```
3. Os dados são atualizados automaticamente **a cada 30 segundos** e sempre que a aba volta a ficar visível — sem precisar recarregar a página.

### Formato dos dados

O JSON tem uma chave por setor. Os campos `potes` e `linhas` aceitam dois formatos: objeto (`{"1": "...", "2": "..."}`) ou string separada por pipe (`"a|b|c|d|e"`).

```json
{
  "ADM": {
    "abastecedor": "Nome do abastecedor",
    "datahora": "2026-07-08",
    "horario": "22:13",
    "potes":  { "1": "COOKIES CHOC BRANCO FUTURINHOS 30X60g" },
    "linhas": { "1": "Linha01" }
  }
}
```

Potes vazios (valor em branco, `-` ou `—`) não aparecem na página. O contador ao lado de "Biscoitos nos potes" mostra a quantidade de potes abastecidos.

## Interface

- **Hero** com o logo Capricche, título, setor em destaque e indicador "Ao vivo"
- **Card de último abastecimento**: horário, data e abastecedor, com selo de status
- **Lista de potes** abastecidos, com número do pote, biscoito e linha de produção
- **Botão ⓘ** no topo abre um modal explicando a página (fecha por X, "Entendi", ESC ou clique fora)
- **Estados desenhados**: carregamento (skeleton), aguardando abastecimento, erro com botão "Tentar novamente"
- **Dark mode automático** conforme a preferência do sistema
- Responsivo (mobile-first) e com animações que respeitam `prefers-reduced-motion`

### Identidade visual

Segue o design system do portal **Capricche Conectada**: paleta mediterrânea (terra cotta `#BF5133`, sand, olive, ochre), fontes **Inter** e **JetBrains Mono**, e os mesmos tokens de cor nos modos claro e escuro.

## Segurança

- Todos os valores vindos do JSON passam por **escape de HTML** antes de serem renderizados (prevenção de XSS)
- Pastas de assets protegidas contra listagem de diretório por `index.html` de redirecionamento com `noindex`
- Nenhum dado sensível é armazenado no cliente; a página apenas lê um JSON público

## Publicação

É um site estático — basta hospedar a pasta inteira (GitHub Pages, Nginx, Apache, IIS). Não há build nem dependências; as únicas requisições externas são o Google Fonts e o JSON de dados.

Em servidores Apache próprios, recomenda-se complementar a proteção de listagem com `Options -Indexes` no `.htaccess`.

---

© 2026 Tecnologia & Inovação · **Capricche é Show!**
