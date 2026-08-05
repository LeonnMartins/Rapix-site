document.addEventListener('DOMContentLoaded', function() {
    // ============================================================
    // 1. PRELOADER - Fundo cinza suave (F5F7FA) + fade
    // ============================================================
    const preloader = document.getElementById('preloader');
    const preloaderVideo = document.getElementById('preloaderVideo');

    if (preloader) {
        document.body.classList.add('preloading');
        document.body.style.overflow = 'hidden';

        let hidden = false;
        const hidePreloader = () => {
            if (hidden) return;
            hidden = true;
            preloader.classList.add('preloader--hide');
            document.body.classList.remove('preloading');
            document.body.style.overflow = '';
            setTimeout(() => { preloader.style.display = 'none'; }, 900);
        };

        if (preloaderVideo) {
            preloaderVideo.load();
            
            preloaderVideo.addEventListener('ended', hidePreloader);
            preloaderVideo.addEventListener('error', hidePreloader);
            
            let fallbackTimer = setTimeout(() => { 
                if (!hidden) hidePreloader(); 
            }, 6000);
            
            preloaderVideo.addEventListener('playing', () => { 
                clearTimeout(fallbackTimer); 
            });
        } else {
            hidePreloader();
        }
    }

    // ============================================================
    // 2. MENU MOBILE
    // ============================================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('open'));
    });

    // ============================================================
    // 3. HEADER SCROLL & PROGRESS
    // ============================================================
    const header = document.getElementById('header');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 60) header.classList.add('scrolled');
        else if (scrollY < 20) header.classList.remove('scrolled');

        if (backToTop) backToTop.classList.toggle('show', scrollY > 500);

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = Math.max(progress, 2) + '%';
    }, { passive: true });

    // ============================================================
    // 4. FAQ
    // ============================================================
    document.querySelectorAll('.faq-pergunta').forEach(pergunta => {
        pergunta.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // ============================================================
    // 5. VERIFICADOR DE CEP
    // ============================================================
    const verificarBtn = document.getElementById('verificarCep');
    const cepInput = document.getElementById('cepInput');
    const resultado = document.getElementById('resultado-cep');

    const ESTADOS_ATENDIDOS = ['CE', 'PA'];
    const CIDADES_ATENDIDAS = [
        'maranguape', 'maracanaú', 'maracanau', 'canindé', 'caninde',
        'caridade', 'aratuba', 'belém', 'belem', 'ananindeua',
        'santarém', 'santarem', 'altamira', 'marabá', 'campos belos'
    ];

    function normalizarTexto(texto) {
        return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    function mostrarResultadoCep(mensagem, tipo) {
        if (!resultado) return;
        resultado.style.display = 'block';
        resultado.innerHTML = mensagem;
        resultado.style.color = '#fff';
        resultado.style.background = tipo === 'sucesso' ? 'rgba(22, 163, 74, 0.25)' :
            tipo === 'erro' ? 'rgba(220, 38, 38, 0.3)' :
            'rgba(255, 177, 0, 0.2)';
    }

    async function verificarCobertura() {
        if (!cepInput || !verificarBtn) return;
        const valorDigitado = cepInput.value.trim();
        if (valorDigitado.length <= 2) {
            mostrarResultadoCep('⚠️ Digite um CEP ou bairro válido.', 'aviso');
            return;
        }

        const apenasNumeros = valorDigitado.replace(/\D/g, '');
        const pareceCep = apenasNumeros.length === 8;

        verificarBtn.disabled = true;
        verificarBtn.innerText = 'Verificando...';

        try {
            if (pareceCep) {
                const resp = await fetch(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
                const dados = await resp.json();

                if (dados.erro) {
                    mostrarResultadoCep('⚠️ CEP não encontrado. Confira o número digitado.', 'aviso');
                } else if (ESTADOS_ATENDIDOS.includes(dados.uf)) {
                    mostrarResultadoCep(`✅ Cobertura confirmada em ${dados.localidade} - ${dados.uf}! Fale conosco para assinar.`,
                        'sucesso');
                } else {
                    mostrarResultadoCep(`❌ Ainda não atendemos ${dados.localidade} - ${dados.uf}. Deixe seu contato, avisaremos quando chegarmos!`,
                        'erro');
                }
            } else {
                const textoBusca = normalizarTexto(valorDigitado);
                const encontrado = CIDADES_ATENDIDAS.some(cidade =>
                    textoBusca.includes(cidade) || cidade.includes(textoBusca)
                );
                mostrarResultadoCep(
                    encontrado ? '✅ Cobertura confirmada para a sua região!' :
                    '❌ Não encontramos cobertura. Tente digitar o CEP completo ou fale conosco pelo WhatsApp.',
                    encontrado ? 'sucesso' : 'erro'
                );
            }
        } catch {
            mostrarResultadoCep('⚠️ Não foi possível verificar. Tente novamente.', 'aviso');
        } finally {
            verificarBtn.disabled = false;
            verificarBtn.innerText = 'Verificar Disponibilidade';
        }
    }

    if (verificarBtn) verificarBtn.addEventListener('click', verificarCobertura);
    if (cepInput) cepInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verificarCobertura(); });

    // ============================================================
    // 6. REVEAL ON SCROLL
    // ============================================================
    const revealEls = document.querySelectorAll('.reveal');
    const prefersReducedMotion = false;
    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in-view'));
    }

    // ============================================================
    // 7. CARROSSEL DE DEPOIMENTOS
    // ============================================================
    const depOuter = document.getElementById('depoimentosCarousel');
    const depTrack = document.getElementById('depoimentosTrack');
    if (depOuter && depTrack) {
        const depPrev = document.getElementById('depPrev');
        const depNext = document.getElementById('depNext');
        const depDotsWrap = document.getElementById('depDots');
        const realCards = Array.from(depTrack.children);
        const total = realCards.length;
        const CLONES = 4;

        realCards.slice(-CLONES).reverse().forEach(card => {
            depTrack.insertBefore(card.cloneNode(true), depTrack.firstChild);
        });
        realCards.slice(0, CLONES).forEach(card => {
            depTrack.appendChild(card.cloneNode(true));
        });

        if (depDotsWrap) {
            realCards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
                dot.addEventListener('click', () => goTo(CLONES + i));
                depDotsWrap.appendChild(dot);
            });
        }
        const dots = depDotsWrap ? Array.from(depDotsWrap.children) : [];

        let pos = CLONES;
        let animating = false;

        function step() {
            const card = depTrack.children[0];
            if (!card) return 320;
            const style = getComputedStyle(depTrack);
            const gap = parseFloat(style.columnGap || style.gap || 26);
            return card.getBoundingClientRect().width + gap;
        }

        function apply(instant) {
            if (instant) depTrack.classList.add('no-transition');
            depTrack.style.transform = `translateX(${-pos * step()}px)`;
            if (instant) {
                void depTrack.offsetHeight;
                depTrack.classList.remove('no-transition');
            }
        }

        function updateDots() {
            if (dots.length === 0) return;
            const logical = ((pos - CLONES) % total + total) % total;
            dots.forEach((d, i) => d.classList.toggle('active', i === logical));
        }

        function goTo(newPos) {
            if (animating) return;
            animating = true;
            pos = newPos;
            apply(false);
            updateDots();
        }

        depTrack.addEventListener('transitionend', () => {
            animating = false;
            if (pos >= CLONES + total) { pos -= total;
                apply(true); } else if (pos < CLONES) { pos += total;
                apply(true); }
        });

        if (depPrev) depPrev.addEventListener('click', () => { stopAutoplay();
            goTo(pos - 1);
            startAutoplay(); });
        if (depNext) depNext.addEventListener('click', () => { stopAutoplay();
            goTo(pos + 1);
            startAutoplay(); });

        let depAutoplay;

        function startAutoplay() {
            if (prefersReducedMotion) return;
            clearInterval(depAutoplay);
            depAutoplay = setInterval(() => goTo(pos + 1), 4500);
        }

        function stopAutoplay() { clearInterval(depAutoplay); }

        depOuter.addEventListener('mouseenter', stopAutoplay);
        depOuter.addEventListener('mouseleave', startAutoplay);

        let dragStartX = 0,
            dragging = false;

        function dragStart(x) {
            dragging = true;
            stopAutoplay();
            dragStartX = x;
            depOuter.classList.add('grabbing');
        }

        function dragEnd(x) {
            if (!dragging) return;
            dragging = false;
            depOuter.classList.remove('grabbing');
            const delta = x - dragStartX;
            if (delta > 50) goTo(pos - 1);
            else if (delta < -50) goTo(pos + 1);
            startAutoplay();
        }
        depOuter.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
        depOuter.addEventListener('touchend', e => dragEnd(e.changedTouches[0].clientX), { passive: true });
        depOuter.addEventListener('mousedown', e => { e.preventDefault();
            dragStart(e.clientX); });
        window.addEventListener('mouseup', e => dragEnd(e.clientX));

        apply(true);
        updateDots();
        startAutoplay();
        window.addEventListener('resize', () => apply(true));
    }

    // ============================================================
    // 8. CONTADORES
    // ============================================================
    const counters = document.querySelectorAll('.counter');
    const animateCounter = (el) => {
        const target = +el.dataset.target;
        const duration = 1500;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));

    // ============================================================
    // 9. CANVAS DE FIBRA
    // ============================================================
    const canvas = document.getElementById('fiberCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let fibers = [];

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function initFibers() {
            fibers = Array.from({ length: 25 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                len: 100 + Math.random() * 100,
                speed: 0.8 + Math.random() * 1.2,
                opacity: 0.2 + Math.random() * 0.3
            }));
        }

        function drawFibers() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            fibers.forEach(f => {
                ctx.beginPath();
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x + f.len, f.y - f.len * 0.5);
                ctx.strokeStyle = `rgba(255, 122, 26, ${f.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                f.x += f.speed;
                f.y -= f.speed * 0.5;

                if (f.x > canvas.width || f.y < 0) {
                    f.x = Math.random() * canvas.width - 200;
                    f.y = canvas.height + 100;
                }
            });
            if (!prefersReducedMotion) requestAnimationFrame(drawFibers);
        }

        resizeCanvas();
        initFibers();
        if (!prefersReducedMotion) drawFibers();
        window.addEventListener('resize', resizeCanvas);
    }

    // ============================================================
    // 10. BACK TO TOP
    // ============================================================
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================================
    // 11. FORMULÁRIO DE CONTATO COM UPLOAD DE CURRÍCULO OBRIGATÓRIO
    // ============================================================
    const formContato = document.getElementById('formContato');
    const formMsg = document.getElementById('formMsg');
    const formErrorMsg = document.getElementById('formErrorMsg');
    const formSubmitBtn = document.getElementById('formSubmitBtn');

    const campoNome = document.getElementById('formNome');
    const campoEmail = document.getElementById('formEmail');
    const campoTelefone = document.getElementById('formTelefone');
    const campoCargo = document.getElementById('formCargo');
    const campoCurriculo = document.getElementById('formCurriculo');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileRemove = document.getElementById('fileRemove');

    const errorNome = document.getElementById('formNomeError');
    const errorEmail = document.getElementById('formEmailError');
    const errorTelefone = document.getElementById('formTelefoneError');
    const errorCargo = document.getElementById('formCargoError');
    const errorCurriculo = document.getElementById('formCurriculoError');

    function validarNome(valor) {
        const trimmed = valor.trim();
        if (trimmed.length < 2) return false;
        const regex = /^[a-zA-ZÀ-ÿ'\- ]+$/;
        if (!regex.test(trimmed)) return false;
        const invalidos = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '@', '#', '$', '%', '&', '*'];
        for (let char of trimmed) {
            if (invalidos.includes(char)) return false;
        }
        if (/(.)\1{5,}/.test(trimmed)) return false;
        return true;
    }

    function validarEmail(valor) {
        const trimmed = valor.trim();
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!regex.test(trimmed)) return false;
        const parts = trimmed.split('@');
        if (parts.length !== 2) return false;
        if (parts[0].length === 0) return false;
        const domainParts = parts[1].split('.');
        if (domainParts.length < 2) return false;
        if (domainParts.some(p => p.length === 0)) return false;
        if (trimmed.includes('..')) return false;
        if (trimmed.includes(' ')) return false;
        return true;
    }

    function validarTelefone(valor) {
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length < 10 || numeros.length > 11) return false;
        if (numeros.length === 10) {
            if (numeros[0] !== '0' && numeros[2] !== '9') return true;
            return false;
        }
        if (numeros.length === 11) {
            if (/^(\d)\1{10}$/.test(numeros)) return false;
            if (numeros[2] !== '9') return false;
            return true;
        }
        return false;
    }

    function validarCargo(valor) {
        return valor.trim().length >= 2;
    }

    function aplicarMascaraTelefone(valor) {
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }

    campoTelefone.addEventListener('input', function() {
        const pos = this.selectionStart;
        const old = this.value;
        const novo = aplicarMascaraTelefone(this.value);
        this.value = novo;
        if (pos < old.length) {
            const diff = novo.length - old.length;
            this.setSelectionRange(pos + diff, pos + diff);
        }
    });

    function validarCampoContato(campo, validacao, elementoErro, mensagemErro) {
        const valor = campo.value;
        const isValid = validacao(valor);
        if (isValid) {
            campo.classList.remove('error');
            campo.classList.add('success');
            elementoErro.classList.remove('show');
        } else {
            campo.classList.remove('success');
            campo.classList.add('error');
            elementoErro.textContent = mensagemErro || 'Campo inválido.';
            elementoErro.classList.add('show');
        }
        return isValid;
    }

    function configurarValidacaoContato(campo, validacao, elementoErro, mensagemErro, evento = 'blur') {
        campo.addEventListener(evento, function() {
            validarCampoContato(campo, validacao, elementoErro, mensagemErro);
        });
        campo.addEventListener('input', function() {
            if (campo.classList.contains('error')) {
                campo.classList.remove('error');
                elementoErro.classList.remove('show');
            }
            if (campo.classList.contains('success')) {
                if (!validacao(campo.value)) {
                    campo.classList.remove('success');
                }
            }
        });
    }

    configurarValidacaoContato(campoNome, validarNome, errorNome, 'Digite um nome válido (apenas letras).');
    configurarValidacaoContato(campoEmail, validarEmail, errorEmail, 'Digite um e-mail válido.');
    configurarValidacaoContato(campoTelefone, validarTelefone, errorTelefone,
        'Digite um telefone válido com DDD.');
    configurarValidacaoContato(campoCargo, validarCargo, errorCargo, 'Digite o cargo desejado.');

    let arquivoSelecionado = null;

    fileUploadArea.addEventListener('click', () => campoCurriculo.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            processarArquivo(e.dataTransfer.files[0]);
        }
    });

    campoCurriculo.addEventListener('change', function() {
        if (this.files.length > 0) {
            processarArquivo(this.files[0]);
        }
    });

    function processarArquivo(file) {
        const tamanhoMaximo = 5 * 1024 * 1024;
        const tiposPermitidos = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de arquivo não suportado. Envie PDF, DOC ou DOCX.');
            campoCurriculo.value = '';
            return;
        }

        if (file.size > tamanhoMaximo) {
            alert('Arquivo muito grande. O tamanho máximo é 5MB.');
            campoCurriculo.value = '';
            return;
        }

        arquivoSelecionado = file;
        fileName.textContent = file.name;
        fileInfo.classList.add('show');
        fileUploadArea.style.display = 'none';
        errorCurriculo.classList.remove('show');
        campoCurriculo.classList.remove('error');
        campoCurriculo.classList.add('success');
    }

    fileRemove.addEventListener('click', function(e) {
        e.stopPropagation();
        arquivoSelecionado = null;
        campoCurriculo.value = '';
        fileInfo.classList.remove('show');
        fileUploadArea.style.display = 'block';
        campoCurriculo.classList.remove('success');
    });

    formContato.addEventListener('submit', async function(e) {
        e.preventDefault();

        const validacoes = [
            { campo: campoNome, validacao: validarNome, error: errorNome, msg: 'Digite um nome válido.' },
            { campo: campoEmail, validacao: validarEmail, error: errorEmail, msg: 'Digite um e-mail válido.' },
            { campo: campoTelefone, validacao: validarTelefone, error: errorTelefone,
            msg: 'Digite um telefone válido.' },
            { campo: campoCargo, validacao: validarCargo, error: errorCargo, msg: 'Digite o cargo desejado.' },
        ];

        let formularioValido = true;

        validacoes.forEach(({ campo, validacao, error, msg }) => {
            const isValid = validacao(campo.value);
            if (!isValid) {
                campo.classList.add('error');
                campo.classList.remove('success');
                error.textContent = msg;
                error.classList.add('show');
                formularioValido = false;
            } else {
                campo.classList.remove('error');
                campo.classList.add('success');
                error.classList.remove('show');
            }
        });

        // Validação do currículo (obrigatório)
        if (!arquivoSelecionado) {
            campoCurriculo.classList.add('error');
            errorCurriculo.classList.add('show');
            formularioValido = false;
        } else {
            campoCurriculo.classList.remove('error');
            errorCurriculo.classList.remove('show');
        }

        if (!formularioValido) {
            const primeiroErro = formContato.querySelector('input.error, select.error');
            if (primeiroErro) primeiroErro.focus();
            return;
        }

        formSubmitBtn.disabled = true;
        formSubmitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
        formMsg.classList.remove('show');
        formErrorMsg.classList.remove('show');

        try {
            const formData = new FormData();
            formData.append('_subject', `[Rapix] Candidatura para ${campoCargo.value.trim()} - ${campoNome.value.trim()}`);
            formData.append('_captcha', 'false');
            formData.append('_template', 'table');
            formData.append('Nome', campoNome.value.trim());
            formData.append('Email', campoEmail.value.trim());
            formData.append('Telefone', campoTelefone.value.trim());
            formData.append('Cargo', campoCargo.value.trim());

            if (arquivoSelecionado) {
                formData.append('curriculo', arquivoSelecionado);
            }

            const response = await fetch('https://formsubmit.co/ajax/contato@rapix.com.br', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Erro no servidor');

            await response.json();

            formMsg.classList.add('show');
            formContato.reset();
            arquivoSelecionado = null;
            fileInfo.classList.remove('show');
            fileUploadArea.style.display = 'block';

            formContato.querySelectorAll('.success, .error').forEach(el => {
                el.classList.remove('success', 'error');
            });
            formContato.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
            });

            setTimeout(() => formMsg.classList.remove('show'), 6000);

        } catch (error) {
            console.error('Erro no envio:', error);
            formErrorMsg.classList.add('show');
            setTimeout(() => formErrorMsg.classList.remove('show'), 6000);
        } finally {
            formSubmitBtn.disabled = false;
            formSubmitBtn.innerHTML = '<span>Enviar Mensagem</span> <i class="fas fa-paper-plane"></i>';
        }
    });

    // ============================================================
    // 12. MODAL DE CONTRATAÇÃO — VALIDAÇÃO INTELIGENTE
    // ============================================================

    const modalOverlay = document.getElementById('modalContratacao');
    const modalClose = document.getElementById('modalClose');
    const modalForm = document.getElementById('modalForm');
    const modalSubmit = document.getElementById('modalSubmit');
    const modalSuccess = document.getElementById('modalSuccess');
    const modalError = document.getElementById('modalError');
    const modalSuccessClose = document.getElementById('modalSuccessClose');
    const modalErrorRetry = document.getElementById('modalErrorRetry');

    const mNome = document.getElementById('modalNome');
    const mSobrenome = document.getElementById('modalSobrenome');
    const mEmail = document.getElementById('modalEmail');
    const mCelular = document.getElementById('modalCelular');
    const mVencimento = document.getElementById('modalVencimento');
    const mCpf = document.getElementById('modalCpf');
    const mEndereco = document.getElementById('modalEndereco');
    const mComplemento = document.getElementById('modalComplemento');
    const mBairro = document.getElementById('modalBairro');
    const mCidade = document.getElementById('modalCidade');
    const mCep = document.getElementById('modalCep');
    const mReferencia = document.getElementById('modalReferencia');

    const eNome = document.getElementById('modalNomeError');
    const eSobrenome = document.getElementById('modalSobrenomeError');
    const eEmail = document.getElementById('modalEmailError');
    const eCelular = document.getElementById('modalCelularError');
    const eVencimento = document.getElementById('modalVencimentoError');
    const eCpf = document.getElementById('modalCpfError');
    const eEndereco = document.getElementById('modalEnderecoError');
    const eBairro = document.getElementById('modalBairroError');
    const eCidade = document.getElementById('modalCidadeError');
    const eCep = document.getElementById('modalCepError');

    function validarNomeModal(v) {
        const trimmed = v.trim();
        if (trimmed.length < 2) return false;
        const regex = /^[a-zA-ZÀ-ÿ'\- ]+$/;
        if (!regex.test(trimmed)) return false;
        const invalidos = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '@', '#', '$', '%', '&', '*'];
        for (let char of trimmed) {
            if (invalidos.includes(char)) return false;
        }
        if (/(.)\1{5,}/.test(trimmed)) return false;
        return true;
    }

    function validarEmailModal(v) {
        const trimmed = v.trim();
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!regex.test(trimmed)) return false;
        const parts = trimmed.split('@');
        if (parts.length !== 2) return false;
        if (parts[0].length === 0) return false;
        const domainParts = parts[1].split('.');
        if (domainParts.length < 2) return false;
        if (domainParts.some(p => p.length === 0)) return false;
        if (trimmed.includes('..')) return false;
        if (trimmed.includes(' ')) return false;
        return true;
    }

    function validarCelularModal(v) {
        const numeros = v.replace(/\D/g, '');
        if (numeros.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(numeros)) return false;
        if (numeros[2] !== '9') return false;
        return true;
    }

    function validarCpfModal(v) {
        const numeros = v.replace(/\D/g, '');
        if (numeros.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(numeros)) return false;
        let soma = 0,
            resto;
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(numeros[i - 1]) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(numeros[9])) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(numeros[i - 1]) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(numeros[10])) return false;
        return true;
    }

    function validarCepModal(v) {
        const numeros = v.replace(/\D/g, '');
        if (numeros.length !== 8) return false;
        return true;
    }

    function aplicarMascaraCelularModal(v) {
        const numeros = v.replace(/\D/g, '');
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        if (numeros.length <= 11) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
        }
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }

    function aplicarMascaraCpfModal(v) {
        const numeros = v.replace(/\D/g, '');
        if (numeros.length === 0) return '';
        if (numeros.length <= 3) return numeros;
        if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
        if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
    }

    function aplicarMascaraCepModal(v) {
        const numeros = v.replace(/\D/g, '');
        if (numeros.length === 0) return '';
        if (numeros.length <= 5) return numeros;
        return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
    }

    mCelular.addEventListener('input', function() {
        const pos = this.selectionStart;
        const old = this.value;
        const novo = aplicarMascaraCelularModal(this.value);
        this.value = novo;
        if (pos < old.length) {
            const diff = novo.length - old.length;
            this.setSelectionRange(pos + diff, pos + diff);
        }
    });

    mCpf.addEventListener('input', function() {
        const pos = this.selectionStart;
        const old = this.value;
        const novo = aplicarMascaraCpfModal(this.value);
        this.value = novo;
        if (pos < old.length) {
            const diff = novo.length - old.length;
            this.setSelectionRange(pos + diff, pos + diff);
        }
    });

    mCep.addEventListener('input', function() {
        const pos = this.selectionStart;
        const old = this.value;
        const novo = aplicarMascaraCepModal(this.value);
        this.value = novo;
        if (pos < old.length) {
            const diff = novo.length - old.length;
            this.setSelectionRange(pos + diff, pos + diff);
        }
    });

    function validarCampoModal(campo, validacao, elementoErro, mensagemErro) {
        const valor = campo.value;
        if (campo === mVencimento) {
            const isSelected = valor !== '';
            if (isSelected) {
                campo.classList.remove('error');
                campo.classList.add('success');
                elementoErro.classList.remove('show');
            } else {
                campo.classList.remove('success');
                campo.classList.add('error');
                elementoErro.textContent = mensagemErro || 'Selecione uma opção.';
                elementoErro.classList.add('show');
            }
            return isSelected;
        }
        // Campos opcionais: complemento e referência
        if (campo === mComplemento || campo === mReferencia) {
            if (valor.trim() === '') {
                campo.classList.remove('error', 'success');
                elementoErro.classList.remove('show');
                return true;
            }
        }
        const isValid = validacao(valor);
        if (isValid) {
            campo.classList.remove('error');
            campo.classList.add('success');
            elementoErro.classList.remove('show');
        } else {
            campo.classList.remove('success');
            campo.classList.add('error');
            elementoErro.textContent = mensagemErro || 'Campo inválido.';
            elementoErro.classList.add('show');
        }
        return isValid;
    }

    function configurarValidacaoModal(campo, validacao, elementoErro, mensagemErro, evento = 'blur') {
        campo.addEventListener(evento, function() {
            validarCampoModal(campo, validacao, elementoErro, mensagemErro);
        });
        campo.addEventListener('input', function() {
            if (campo.classList.contains('error')) {
                campo.classList.remove('error');
                elementoErro.classList.remove('show');
            }
            if (campo.classList.contains('success')) {
                if (!validacao(campo.value)) {
                    campo.classList.remove('success');
                }
            }
        });
    }

    configurarValidacaoModal(mNome, validarNomeModal, eNome, 'Digite um nome válido (apenas letras).');
    configurarValidacaoModal(mSobrenome, validarNomeModal, eSobrenome, 'Digite um sobrenome válido (apenas letras).');
    configurarValidacaoModal(mEmail, validarEmailModal, eEmail, 'Digite um e-mail válido (ex: nome@dominio.com).');
    configurarValidacaoModal(mCelular, validarCelularModal, eCelular,
        'Digite um celular válido com DDD (ex: (85) 99999-9999).');
    configurarValidacaoModal(mVencimento, (v) => v !== '', eVencimento, 'Selecione o dia de vencimento.');
    configurarValidacaoModal(mCpf, validarCpfModal, eCpf, 'Digite um CPF válido (ex: 123.456.789-09).');
    configurarValidacaoModal(mEndereco, (v) => v.trim().length >= 3, eEndereco, 'Digite seu endereço.');
    configurarValidacaoModal(mBairro, (v) => v.trim().length >= 2, eBairro, 'Digite seu bairro.');
    configurarValidacaoModal(mCidade, (v) => v.trim().length >= 2, eCidade, 'Digite sua cidade.');
    configurarValidacaoModal(mCep, validarCepModal, eCep, 'Digite um CEP válido (ex: 00000-000).');

    const planosData = {
        '600 Mega': { nome: '600 Mega', preco: '89,90', badge: 'Plano 600 Mega', isPremium: false },
        '800 Mega': { nome: '800 Mega', preco: '119,90', badge: 'Plano 800 Mega', isPremium: false },
        '1 Giga': { nome: '1 Giga', preco: '179,90', badge: 'MAIS VENDIDO', isPremium: true },
    };

    const modalBadge = document.getElementById('modalBadge');
    const modalPlanoNome = document.getElementById('modalPlanoNome');
    const modalPlanoPreco = document.getElementById('modalPlanoPreco');

    function abrirModal(planoNome) {
        const dados = planosData[planoNome];
        if (!dados) return;
        modalBadge.textContent = dados.badge;
        modalBadge.className = 'modal-plano-badge' + (dados.isPremium ? ' premium-badge' : '');
        modalPlanoNome.textContent = dados.nome;
        modalPlanoPreco.textContent = dados.preco;
        resetarModal();
        modalOverlay.classList.add('open');
        modalOverlay.classList.remove('closing');
        document.body.style.overflow = 'hidden';
        setTimeout(() => mNome.focus(), 100);
    }

    function resetarModal() {
        modalForm.reset();
        modalForm.style.display = 'flex';
        document.querySelectorAll('.modal-form .form-group input, .modal-form .form-group select').forEach(el => {
            el.classList.remove('error', 'success');
        });
        document.querySelectorAll('.modal-form .error-message').forEach(el => {
            el.classList.remove('show');
        });
        modalSuccess.classList.remove('show');
        modalSuccess.style.display = 'none';
        modalError.classList.remove('show');
        modalError.style.display = 'none';
        modalSubmit.disabled = false;
        modalSubmit.innerHTML = '<span>Efetuar Cadastro</span> <i class="fas fa-arrow-right"></i>';
    }

    document.querySelectorAll('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const plano = this.dataset.plano;
            abrirModal(plano);
        });
    });

    function fecharModal() {
        modalOverlay.classList.add('closing');
        setTimeout(() => {
            modalOverlay.classList.remove('open', 'closing');
            document.body.style.overflow = '';
            resetarModal();
        }, 300);
    }

    modalClose.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            fecharModal();
        }
    });
    modalSuccessClose.addEventListener('click', fecharModal);

    modalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const validacoes = [
            { campo: mNome, validacao: validarNomeModal, error: eNome, msg: 'Digite um nome válido.' },
            { campo: mSobrenome, validacao: validarNomeModal, error: eSobrenome,
            msg: 'Digite um sobrenome válido.' },
            { campo: mEmail, validacao: validarEmailModal, error: eEmail,
            msg: 'Digite um e-mail válido (ex: nome@dominio.com).' },
            { campo: mCelular, validacao: validarCelularModal, error: eCelular,
            msg: 'Digite um celular válido com DDD (ex: (85) 99999-9999).' },
            { campo: mVencimento, validacao: (v) => v !== '', error: eVencimento,
            msg: 'Selecione o dia de vencimento.' },
            { campo: mCpf, validacao: validarCpfModal, error: eCpf,
            msg: 'Digite um CPF válido (ex: 123.456.789-09).' },
            { campo: mEndereco, validacao: (v) => v.trim().length >= 3, error: eEndereco,
            msg: 'Digite seu endereço.' },
            { campo: mBairro, validacao: (v) => v.trim().length >= 2, error: eBairro,
            msg: 'Digite seu bairro.' },
            { campo: mCidade, validacao: (v) => v.trim().length >= 2, error: eCidade,
            msg: 'Digite sua cidade.' },
            { campo: mCep, validacao: validarCepModal, error: eCep, msg: 'Digite um CEP válido.' },
        ];

        let formularioValido = true;

        validacoes.forEach(({ campo, validacao, error, msg }) => {
            const isValid = validacao(campo.value);
            if (!isValid) {
                campo.classList.add('error');
                campo.classList.remove('success');
                error.textContent = msg;
                error.classList.add('show');
                formularioValido = false;
            } else {
                campo.classList.remove('error');
                campo.classList.add('success');
                error.classList.remove('show');
            }
        });

        if (!formularioValido) {
            const primeiroErro = document.querySelector(
                '.modal-form .form-group input.error, .modal-form .form-group select.error');
            if (primeiroErro) {
                primeiroErro.focus();
                primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const dados = {
            plano: modalPlanoNome.textContent,
            nome: mNome.value.trim(),
            sobrenome: mSobrenome.value.trim(),
            email: mEmail.value.trim(),
            celular: mCelular.value.replace(/\D/g, ''),
            vencimento: mVencimento.value,
            cpf: mCpf.value.replace(/\D/g, ''),
            endereco: mEndereco.value.trim(),
            complemento: mComplemento.value.trim(),
            bairro: mBairro.value.trim(),
            cidade: mCidade.value.trim(),
            cep: mCep.value.replace(/\D/g, ''),
            referencia: mReferencia.value.trim(),
        };

        modalSubmit.disabled = true;
        modalSubmit.innerHTML = '<span class="spinner"></span> Enviando...';

        const formData = new FormData();
        formData.append('_subject', `Nova Assinatura - Plano ${dados.plano}`);
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');
        formData.append('Plano', dados.plano);
        formData.append('Nome', dados.nome);
        formData.append('Sobrenome', dados.sobrenome);
        formData.append('Email', dados.email);
        formData.append('Celular', dados.celular);
        formData.append('Dia Vencimento', dados.vencimento);
        formData.append('CPF', dados.cpf);
        formData.append('Endereço', dados.endereco);
        formData.append('Complemento', dados.complemento);
        formData.append('Bairro', dados.bairro);
        formData.append('Cidade', dados.cidade);
        formData.append('CEP', dados.cep);
        formData.append('Ponto Referência', dados.referencia);

        fetch('https://formsubmit.co/ajax/contato@rapix.com.br', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro no servidor');
                return response.json();
            })
            .then(() => {
                modalForm.style.display = 'none';
                modalSuccess.style.display = 'block';
                modalSuccess.classList.add('show');
                modalSubmit.disabled = false;
            })
            .catch((error) => {
                console.error('Erro no envio:', error);
                modalForm.style.display = 'none';
                modalError.style.display = 'block';
                modalError.classList.add('show');
                modalSubmit.disabled = false;
                modalSubmit.innerHTML = '<span>Efetuar Cadastro</span> <i class="fas fa-arrow-right"></i>';
            });
    });

    modalErrorRetry.addEventListener('click', function() {
        modalError.classList.remove('show');
        modalError.style.display = 'none';
        modalForm.style.display = 'flex';
        modalForm.reset();
        document.querySelectorAll('.modal-form .form-group input, .modal-form .form-group select').forEach(el => {
            el.classList.remove('error', 'success');
        });
        document.querySelectorAll('.modal-form .error-message').forEach(el => {
            el.classList.remove('show');
        });
        modalSubmit.disabled = false;
        modalSubmit.innerHTML = '<span>Efetuar Cadastro</span> <i class="fas fa-arrow-right"></i>';
        setTimeout(() => mNome.focus(), 100);
    });

    window.abrirModal = function(planoNome) {
        const mapaPlanos = {
            'modal600': '600 Mega',
            'modal800': '800 Mega',
            'modalGiga': '1 Giga'
        };
        const plano = mapaPlanos[planoNome] || planoNome;
        abrirModal(plano);
    };

    window.fecharModal = function() {
        fecharModal();
    };

    console.log('✅ Site Rapix carregado com sucesso!');
    console.log('📋 Formulário de contato com currículo obrigatório.');
    console.log('📋 Modal de contratação com todos os campos obrigatórios.');
});