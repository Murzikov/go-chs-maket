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
  const files = form.querySelector('[name="files"]');
  const fileNames = form.querySelector('.file__names');

  const setInvalid = (input, invalid) => {
    (input.closest('.field') || input.closest('.consent')).classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', invalid);
  };
  const phoneDigits = () => phone.value.replace(/\D/g, '');

  phone.addEventListener('input', () => phoneDigits().length >= 10 && setInvalid(phone, false));
  name.addEventListener('input', () => name.value.trim() && setInvalid(name, false));
  consent.addEventListener('change', () => consent.checked && setInvalid(consent, false));

  files.addEventListener('change', () => {
    const list = [...files.files].map((file) => file.name);
    fileNames.textContent = list.length ? list.join(', ') : 'PDF, Word или фото, до 20 МБ';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const checks = [[name, !name.value.trim()], [phone, phoneDigits().length < 10], [consent, !consent.checked]];
    checks.forEach(([input, invalid]) => setInvalid(input, invalid));
    const firstError = checks.find(([, invalid]) => invalid);
    if (firstError) {
      firstError[0].focus();
      return;
    }
    // Отправка подключается при переносе на WordPress (Contact Form 7 или свой обработчик).
    form.classList.add('is-sent');
    form.querySelector('.form__done').focus();
  });
}

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
