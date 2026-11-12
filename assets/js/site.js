// Поведение сайта: шапка, меню, форма заявки, панель действий на телефоне.

// Шапка поверх двери на главной становится плотной, как только начинается прокрутка
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Меню на телефоне
const menuButton = document.querySelector('.header__menu');
menuButton.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
document.querySelectorAll('.menu a').forEach((link) =>
  link.addEventListener('click', () => document.body.classList.remove('menu-open')));

// Панель «Позвонить, Telegram, Заявка» прячется, когда форма уже на экране
const callbar = document.querySelector('.callbar');
const formSection = document.querySelector('#zayavka');
if (callbar && formSection && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => callbar.classList.toggle('is-hidden', entry.isIntersecting))
    .observe(formSection);
}

// Форма заявки
const form = document.querySelector('.form');
if (form) {
  const phone = form.querySelector('[name="phone"]');
  const name = form.querySelector('[name="name"]');
  const consent = form.querySelector('[name="consent"]');

  const setInvalid = (input, invalid) => {
    (input.closest('.field') || input.closest('.consent')).classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', invalid);
  };
  const phoneDigits = () => phone.value.replace(/\D/g, '');

  phone.addEventListener('input', () => phoneDigits().length >= 10 && setInvalid(phone, false));
  name.addEventListener('input', () => name.value.trim() && setInvalid(name, false));
  consent.addEventListener('change', () => consent.checked && setInvalid(consent, false));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const checks = [[name, !name.value.trim()], [phone, phoneDigits().length < 10], [consent, !consent.checked]];
    checks.forEach(([input, invalid]) => setInvalid(input, invalid));
    const firstError = checks.find(([, invalid]) => invalid);
    if (firstError) {
      firstError[0].focus();
      return;
    }
    const done = () => {
      form.classList.add('is-sent');
      form.querySelector('.form__done').focus();
      goal('lead');
    };
    // В макете адреса отправки нет (action="#"), там форма только показывает, как будет выглядеть ответ
    if (form.getAttribute('action') === '#') return done();
    const button = form.querySelector('.form__submit');
    button.disabled = true;
    form.classList.remove('is-failed');
    form.elements.page.value = location.href;
    fetch(form.action, { method: 'POST', body: new FormData(form) })
      .then((response) => response.ok ? done() : Promise.reject())
      .catch(() => form.classList.add('is-failed'))
      .finally(() => { button.disabled = false; });
  });
  // Боты не печатают и не кликают: проверочное поле заполняется только от живого ввода
  form.addEventListener('input', () => { form.elements.check.value = 'human'; }, { once: true });
}

// Уведомление о cookie: показывается, пока посетитель не нажал «Понятно»
const cookie = document.querySelector('.cookie');
if (cookie && !localStorage.getItem('cookie-ok')) {
  cookie.hidden = false;
  cookie.querySelector('.cookie__ok').addEventListener('click', () => {
    localStorage.setItem('cookie-ok', '1');
    cookie.hidden = true;
  });
}

// Цели Метрики: заявка, звонок, Telegram, WeChat. На макете счётчика нет, вызов просто пропускается.
function goal(name) {
  if (window.ym) window.ym(108378010, 'reachGoal', name);
}
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="tel:"], a[href*="t.me/"], [data-dialog="wechat"]');
  if (!link) return;
  goal(link.matches('[href^="tel:"]') ? 'call' : link.matches('[href*="t.me/"]') ? 'telegram' : 'wechat');
});

// Окна: QR-код WeChat и дипломы крупно. Закрываются крестиком, Esc и кликом мимо.
document.querySelectorAll('[data-dialog]').forEach((button) =>
  button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal()));

const zoom = document.getElementById('zoom');
document.querySelectorAll('[data-zoom]').forEach((link) =>
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const image = zoom.querySelector('img');
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    zoom.showModal();
  }));

document.querySelectorAll('.dialog').forEach((dialog) => {
  dialog.querySelector('.dialog__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => event.target === dialog && dialog.close());
});
