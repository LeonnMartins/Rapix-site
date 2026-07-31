        document.addEventListener('DOMContentLoaded', () => {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Menu Mobile
            const menuToggle = document.getElementById('menuToggle');
            const navMenu = document.getElementById('navMenu');

            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('open');
                const icon = menuToggle.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });

            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => navMenu.classList.remove('open'));
            });

            // Header Scroll & Barra de Progresso
            const header = document.getElementById('header');
            const scrollProgress = document.getElementById('scrollProgress');
            const backToTop = document.getElementById('backToTop');

            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                header.classList.toggle('scrolled', scrollY > 40);
                backToTop.classList.toggle('show', scrollY > 500);

                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
                scrollProgress.style.width = progress + '%';
            }, { passive: true });

            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });

            // FAQ Accordion
            document.querySelectorAll('.faq-pergunta').forEach(pergunta => {
                pergunta.addEventListener('click', function() {
                    const item = this.parentElement;
                    const isActive = item.classList.contains('active');
                    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                    if (!isActive) item.classList.add('active');
                });
            });

            // ===== Verificador de CEP / Cobertura (checagem real) =====
            const verificarBtn = document.getElementById('verificarCep');
            const cepInput = document.getElementById('cepInput');
            const resultado = document.getElementById('resultado-cep');

            // Estados onde a Rapix realmente atua
            const ESTADOS_ATENDIDOS = ['CE', 'PA', 'RS'];

            // Lista de cidades/bairros atendidos, usada quando o usuário digita um NOME
            // em vez de um CEP (não dá pra consultar UF por API nesse caso).
            // IMPORTANTE: atualize esta lista com todos os municípios que a Rapix realmente atende.
            const CIDADES_ATENDIDAS = [
                'maranguape', 'maracanaú', 'maracanau', 'canindé', 'caninde',
                'caridade', 'aratuba', 'belém', 'belem', 'gramado'
            ];

            function normalizarTexto(texto) {
                return texto
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .trim();
            }

            function mostrarResultadoCep(mensagem, tipo) {
                resultado.style.display = 'block';
                resultado.innerHTML = mensagem;
                resultado.style.color = '#fff';
                if (tipo === 'sucesso') {
                    resultado.style.background = 'rgba(22, 163, 74, 0.25)';
                } else if (tipo === 'erro') {
                    resultado.style.background = 'rgba(220, 38, 38, 0.3)';
                } else {
                    resultado.style.background = 'rgba(255, 177, 0, 0.2)';
                }
            }

            async function verificarCobertura() {
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
                        // Consulta o CEP na API pública ViaCEP para descobrir a cidade/UF
                        const resp = await fetch(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
                        const dados = await resp.json();

                        if (dados.erro) {
                            mostrarResultadoCep('⚠️ CEP não encontrado. Confira o número digitado.', 'aviso');
                        } else if (ESTADOS_ATENDIDOS.includes(dados.uf)) {
                            mostrarResultadoCep(`✅ Cobertura confirmada em ${dados.localidade} - ${dados.uf}! Fale com a gente para assinar.`, 'sucesso');
                        } else {
                            mostrarResultadoCep(`❌ Ainda não atendemos ${dados.localidade} - ${dados.uf}. Deixe seu contato que avisamos quando a Rapix chegar até você!`, 'erro');
                        }
                    } else {
                        // Sem CEP numérico, tenta reconhecer cidade/bairro pelo texto digitado
                        const textoBusca = normalizarTexto(valorDigitado);
                        const encontrado = CIDADES_ATENDIDAS.some(
                            cidade => textoBusca.includes(cidade) || cidade.includes(textoBusca)
                        );

                        if (encontrado) {
                            mostrarResultadoCep('✅ Cobertura confirmada para a sua região!', 'sucesso');
                        } else {
                            mostrarResultadoCep('❌ Não encontramos cobertura para essa região. Tente digitar o CEP completo ou fale com a gente pelo WhatsApp.', 'erro');
                        }
                    }
                } catch (erro) {
                    mostrarResultadoCep('⚠️ Não foi possível verificar agora. Tente novamente em instantes.', 'aviso');
                } finally {
                    verificarBtn.disabled = false;
                    verificarBtn.innerText = 'Verificar Disponibilidade';
                }
            }

            verificarBtn.addEventListener('click', verificarCobertura);
            cepInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') verificarCobertura();
            });

            // Reveal no Scroll
            const revealEls = document.querySelectorAll('.reveal');
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

            // Carrossel de Depoimentos (transform + transition, loop infinito por clonagem)
            const depOuter = document.getElementById('depoimentosCarousel');
            const depTrack = document.getElementById('depoimentosTrack');
            if (depOuter && depTrack) {
                const depPrev = document.getElementById('depPrev');
                const depNext = document.getElementById('depNext');
                const depDotsWrap = document.getElementById('depDots');
                const realCards = Array.from(depTrack.children);
                const total = realCards.length;
                const CLONES = 4; // suficiente para cobrir os cards visíveis em qualquer largura

                // Clona os últimos CLONES cards no início e os primeiros CLONES no fim
                realCards.slice(-CLONES).reverse().forEach(card => {
                    depTrack.insertBefore(card.cloneNode(true), depTrack.firstChild);
                });
                realCards.slice(0, CLONES).forEach(card => {
                    depTrack.appendChild(card.cloneNode(true));
                });

                // Dots (um por card real)
                realCards.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.className = 'dot';
                    dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
                    dot.addEventListener('click', () => goTo(CLONES + i));
                    depDotsWrap.appendChild(dot);
                });
                const dots = Array.from(depDotsWrap.children);

                let pos = CLONES; // posição atual dentro da faixa clonada (real card 0 = CLONES)
                let animating = false;

                function step() {
                    const card = depTrack.children[0];
                    const style = getComputedStyle(depTrack);
                    const gap = parseFloat(style.columnGap || style.gap || 26);
                    return card.getBoundingClientRect().width + gap;
                }

                function apply(instant) {
                    if (instant) depTrack.classList.add('no-transition');
                    depTrack.style.transform = `translateX(${-pos * step()}px)`;
                    if (instant) {
                        // força reflow antes de reativar a transição
                        void depTrack.offsetHeight;
                        depTrack.classList.remove('no-transition');
                    }
                }

                function updateDots() {
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
                    // Reposiciona sem animação ao entrar na zona clonada, criando o loop infinito
                    if (pos >= CLONES + total) {
                        pos -= total;
                        apply(true);
                    } else if (pos < CLONES) {
                        pos += total;
                        apply(true);
                    }
                });

                depPrev.addEventListener('click', () => { stopAutoplay(); goTo(pos - 1); startAutoplay(); });
                depNext.addEventListener('click', () => { stopAutoplay(); goTo(pos + 1); startAutoplay(); });

                // Autoplay
                let depAutoplay;
                function startAutoplay() {
                    if (prefersReducedMotion) return;
                    clearInterval(depAutoplay);
                    depAutoplay = setInterval(() => goTo(pos + 1), 4500);
                }
                function stopAutoplay() {
                    clearInterval(depAutoplay);
                }

                depOuter.addEventListener('mouseenter', stopAutoplay);
                depOuter.addEventListener('mouseleave', startAutoplay);

                // Swipe (touch e mouse)
                let dragStartX = 0, dragging = false;
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
                depOuter.addEventListener('mousedown', e => { e.preventDefault(); dragStart(e.clientX); });
                window.addEventListener('mouseup', e => dragEnd(e.clientX));

                apply(true);
                updateDots();
                startAutoplay();
                window.addEventListener('resize', () => apply(true));
            }

            // Animação de Contadores
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

            // Fundo de Fibra Óptica (Canvas)
            const canvas = document.getElementById('fiberCanvas');
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
        });
