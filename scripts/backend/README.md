# Investment Portfolio API Backend

Backend completo para gerenciamento de carteira de investimentos usando FastAPI e SQLAlchemy, com integração à API Brapi.

## Tecnologias

- **FastAPI**: Framework web moderno e rápido
- **SQLAlchemy**: ORM para banco de dados
- **Pydantic**: Validação de dados
- **JWT**: Autenticação com tokens
- **Brapi**: API de dados do mercado financeiro brasileiro
- **SQLite**: Banco de dados (pode ser alterado para PostgreSQL)

## Instalação

1. Instale as dependências:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Execute o servidor:
\`\`\`bash
python main.py
\`\`\`

O servidor estará disponível em `http://localhost:8000`

## Documentação da API

Acesse a documentação interativa em:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login e obter token JWT
- `GET /api/auth/me` - Obter usuário atual

### Portfolio
- `GET /api/portfolio` - Obter carteira do usuário com todos os ativos

### Assets (Ativos)
- `POST /api/assets` - Adicionar novo ativo
- `GET /api/assets` - Listar todos os ativos
- `GET /api/assets/{id}` - Obter detalhes de um ativo
- `PUT /api/assets/{id}` - Atualizar ativo
- `DELETE /api/assets/{id}` - Remover ativo

### Brapi Integration
- `GET /api/brapi/quote/{ticker}` - Obter cotação de um ticker
- `GET /api/brapi/search?query=` - Buscar tickers
- `GET /api/brapi/tickers` - Listar todos os tickers disponíveis

## Estrutura do Banco de Dados

### User (Usuário)
- id, name, email, password, created_at, is_active

### Portfolio (Carteira)
- id, name, user_id, created_at, updated_at

### Asset (Ativo)
- id, ticker, name, quantity, purchase_price, current_price, portfolio_id
- Propriedades calculadas: total_purchase_value, current_value, gain_loss, gain_loss_percentage

## Configuração de Produção

1. **Alterar SECRET_KEY**: Mude a chave secreta no `main.py`
2. **Configurar CORS**: Ajuste as origens permitidas
3. **Banco de Dados**: Altere para PostgreSQL no `database.py`
4. **Token Brapi**: Obtenha um token real em https://brapi.dev

## Segurança

- Senhas são hasheadas com bcrypt
- Autenticação JWT com expiração de 30 minutos
- Validação de propriedade de recursos (usuário só acessa seus próprios dados)
