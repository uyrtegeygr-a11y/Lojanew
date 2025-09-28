// Base de dados dos produtos (simulado)
const produtos = [
    {
        id: 1,
        nome: "Smartphone Premium",
        preco: 1299.99,
        imagem: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        descricao: "Smartphone com tecnologia avançada e design moderno",
        categoria: "eletrônicos"
    },
    {
        id: 2,
        nome: "Notebook Gamer",
        preco: 2499.99,
        imagem: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
        descricao: "Notebook para jogos com alta performance",
        categoria: "eletrônicos"
    },
    {
        id: 3,
        nome: "Fone Bluetooth",
        preco: 199.99,
        imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        descricao: "Fone de ouvido sem fio com cancelamento de ruído",
        categoria: "eletrônicos"
    },
    {
        id: 4,
        nome: "Smartwatch",
        preco: 599.99,
        imagem: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
        descricao: "Relógio inteligente com monitoramento de saúde",
        categoria: "eletrônicos"
    },
    {
        id: 5,
        nome: "Câmera Digital",
        preco: 899.99,
        imagem: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop",
        descricao: "Câmera profissional para fotografia",
        categoria: "eletrônicos"
    },
    {
        id: 6,
        nome: "Tablet Pro",
        preco: 799.99,
        imagem: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop",
        descricao: "Tablet profissional para trabalho e entretenimento",
        categoria: "eletrônicos"
    }
];

// Função para obter produto por ID
function getProdutoById(id) {
    return produtos.find(produto => produto.id === parseInt(id));
}

// Função para formatar preço
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}