(function () {
  var app = document.getElementById('app'), slides = [].slice.call(document.querySelectorAll('.slide')),
    barsEl = document.getElementById('bars'), ctl = document.getElementById('ctl'), bars = [], cur = -1,
    reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  var pontosQuiz = 0;

  slides.forEach(function (s) {
    var m = document.createElement('div'); m.className = 'mesh'; m.appendChild(document.createElement('i')); s.insertBefore(m, s.firstChild);
    var b = document.createElement('div'); b.className = 'bar'; b.appendChild(document.createElement('i')); barsEl.appendChild(b); bars.push(b);
  });

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    cur = n;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === n) });
    bars.forEach(function (b, k) {
      b.classList.remove('cur'); b.classList.toggle('done', k < n);
      if (k === n) { b.style.setProperty('--dur', (slides[n].dataset.dur || 10) + 's'); void b.offsetWidth; b.classList.add('cur') }
    });
    if (n === slides.length - 1) setTimeout(function () { if (cur === slides.length - 1) burst(innerWidth / 2, innerHeight / 3) }, 700);
  }

  function burst(x, y) {
    if (reduce) return;
    var cs = ['#e8e6e1', '#d3c5b4', '#8c857b', '#4a4843', '#ffffff'];
    for (var i = 0; i < 24; i++) {
      var s = document.createElement('i'); s.className = 'cf'; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = cs[i % 5];
      document.body.appendChild(s);
      var a = Math.random() * 6.28, d = 60 + Math.random() * 140;
      s.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 90) + 'px) rotate(' + Math.random() * 720 + 'deg)', opacity: 0 }],
        { duration: 1200 + Math.random() * 800, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (e) { return function () { e.remove() } })(s);
    }
  }

  bars.forEach(function (b, k) { b.firstChild.addEventListener('animationend', function () { if (k === cur && k < slides.length - 1) go(k + 1) }) });
  document.querySelector('.zone.next').onclick = function () { go(cur + 1) };
  document.querySelector('.zone.prev').onclick = function () { go(cur - 1) };
  document.getElementById('again').onclick = function () { cur = -1; pontosQuiz = 0; go(0) };

  function togglePause(forcePause) {
    var isPaused = typeof forcePause === 'boolean' ? forcePause : !app.classList.contains('paused');
    if (isPaused) {
      app.classList.add('paused');
      ctl.textContent = 'Continuar';
    } else {
      app.classList.remove('paused');
      ctl.textContent = 'Pausar';
    }
  }
  ctl.onclick = togglePause;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(cur + 1) }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(cur - 1) }
    else if (e.key === 'p' || e.key === 'P') { togglePause() }
  });

  // Lógica do Quiz
  [].forEach.call(document.querySelectorAll('.qz'), function (q) {
    var o = q.querySelectorAll('.opt');
    [].forEach.call(o, function (b, k) {
      b.onclick = function () {
        if (q.classList.contains('done')) return;
        togglePause(true);
        q.classList.add('done');
        var ok = +q.dataset.ok;
        b.classList.add(k === ok ? 'ok' : 'no'); o[ok].classList.add('ok');
        q.querySelector('.fb').textContent = (k === ok ? 'Acertou! ' : 'Quase! ') + q.dataset.fb;

        if (k === ok) {
          pontosQuiz++;
          var r = b.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top);
        }
      };
    });
  });

  // Lógica da Máquina de Escrever (Slide 6)
  var twModal = document.getElementById('tw-modal');
  var twText = document.getElementById('tw-text');
  var twQuill = document.getElementById('tw-quill');
  var typeInterval;

  document.querySelectorAll('.list.interactive li').forEach(function (li) {
    li.onclick = function () {
      togglePause(true); // Pausa a apresentação
      twModal.classList.add('active'); // Mostra a carta
      twText.textContent = ''; // Limpa o texto anterior
      twQuill.style.animation = 'bob 0.15s infinite alternate'; // Pena começa a mexer

      var text = li.dataset.reason;
      var i = 0;
      clearInterval(typeInterval);

      // Efeito de digitação letra a letra
      typeInterval = setInterval(function () {
        twText.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(typeInterval);
          twQuill.style.animation = 'none'; // Pena para quando termina
        }
      }, 45); // Velocidade da digitação
    };
  });

  // Fechar a janela modal
  twModal.onclick = function (e) {
    if (e.target === twModal || e.target.classList.contains('tw-close')) {
      twModal.classList.remove('active');
      clearInterval(typeInterval);
      togglePause(false); // Retoma a apresentação
    }
  };

  go(0);
})();
